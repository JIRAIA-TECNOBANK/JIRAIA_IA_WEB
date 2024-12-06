import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { UntypedFormBuilder, FormGroupDirective, Validators } from '@angular/forms';
import { Uf } from '../../../../core/models/geograficos/uf.model';
import { GeograficoService } from '../../../../services/geografico.service';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SubSink } from 'subsink';
import { EnderecoResponse } from '../../../../core/responses/geograficos/endereco.response';
import { Utility } from 'src/app/core/common/utility';
import { Municipio } from '../../../../core/models/geograficos/municipio.model';
import { CriarEnderecoRequest } from '../../../../core/requests/empresas/criar-endereco.request';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { Store } from '@ngrx/store';
import {
  closePreloader,
  showPreloader,
} from 'src/app/shared/store/preloader/actions/preloader.actions';
import { EmpresasService } from '../../../../services/empresas.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { DialogConfirmComponent } from '../dialog-confirm/dialog-confirm.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Permissoes } from 'src/app/core/common/permissoes';

@Component({
  selector: 'app-enderecos-adicionais',
  templateUrl: './enderecos-adicionais.component.html',
  styleUrls: ['./enderecos-adicionais.component.scss'],
})
export class EnderecosAdicionaisComponent implements OnInit {
  @ViewChild(FormGroupDirective) formDirective: FormGroupDirective;

  @Output() isAddressFormCheck: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  @Output() nextStep: EventEmitter<number> = new EventEmitter<number>();
  @Input('companyId') companyId: any;

  addressForm = this.formBuilder.group({
    cep: [null, Validators.required],
    logradouro: [null, Validators.required],
    numero: [null, Validators.required],
    bairro: [null, Validators.required],
    complemento: [null],
    municipio: [null, Validators.required],
    uf: [null, Validators.required],
    principal: false,
    municipioId: [null],
  });

  utility = Utility;
  Permissoes = Permissoes;

  cep$ = new Subject<string>();
  private subscriptions = new SubSink();

  estados: Uf[] = [];
  municipiosFiltrados: Municipio[] = [];

  addresses = [];

  previousCep: string;

  municipioCep: string = null;
  addressId: number;

  // booleans
  isEdition: boolean = false;
  findingAddress: boolean = false;
  isInvalidCep: boolean = false;
  changeCep: boolean = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private geograficoService: GeograficoService,
    private notifierService: NotifierService,
    private empresasService: EmpresasService,
    private store: Store<{ preloader: IPreloaderState }>,
    public dialog: MatDialog
  ) {}

  hasAddress() {
    return this.addresses.length ? true : false;
  }

  isAddressFormValid() {
    return this.addressForm.valid && this.companyId;
  }

  hasAddressId() {
    return this.addressId ? 'Salvar' : 'Adicionar';
  }

  ngOnInit(): void {
    if (!Utility.getPermission([Permissoes.GESTAO_EMPRESA_CADASTRAR])) {
      Utility.modoConsulta(this.addressForm);
    }

    this.addressForm
      .get('cep')
      .valueChanges.pipe(debounceTime(1500))
      .subscribe((cep: string) => {
        if (cep !== this.previousCep) {
          this.previousCep = cep;
          this.changeCep = true;
        }
        this.cep$.next(cep);
      });

    this.subscriptions.add(
      this.cep$.subscribe((data) => {
        if (this.changeCep && data !== '') this.obterEnderecoPorCep(data);
        this.changeCep = false;
      })
    );

    this.getEstados();
    this.companyId && this.getCompanyAddresses();
  }

  getCompanyAddresses() {
    this.store.dispatch(showPreloader({ payload: '' }));
    this.addresses = [];
    this.empresasService
      .obterEmpresasEndereco(this.companyId)
      .subscribe((result) => {
        this.addresses = result.enderecos;
        this.addresses.sort((a, b) => {
          return (a.enderecoPrincipal ? 0 : 1) - (b.enderecoPrincipal ? 0 : 1);
        });
        this.store.dispatch(closePreloader());
      });
  }

  editAddress(address) {
    this.addressId = address.id;
    this.addressForm.patchValue({ ...address.endereco });
    this.addressForm.get('principal').setValue(address.enderecoPrincipal);
    this.addressForm && this.toggleEdition();
  }

  onSubmit() {
    if (this.addressForm.invalid) {
      return;
    }

    let endereco = <CriarEnderecoRequest>{
      logradouro: this.addressForm.get('logradouro').value,
      numero: this.addressForm.get('numero').value,
      complemento: this.addressForm.get('complemento').value,
      bairro: this.addressForm.get('bairro').value,
      municipio: this.addressForm.get('municipio').value,
      cep: this.addressForm.get('cep').value,
      uf: this.addressForm.get('uf').value,
      enderecoPrincipal: this.addressForm.get('principal').value
        ? this.addressForm.get('principal').value
        : false,
      municipioId: this.addressForm.get('municipioId').value,
    };

    this.store.dispatch(showPreloader({ payload: '' }));

    if (this.addressId) {
      this.updateAddress(endereco);
    } else {
      this.createAddress(endereco);
    }
  }

  createAddress(endereco: CriarEnderecoRequest) {
    this.empresasService
      .criarEmpresaEndereco(this.companyId, endereco)
      .toPromise()
      .then((result) => {
        if (result.empresaId) {
          this.getCompanyAddresses();
          this.store.dispatch(closePreloader());
          this.notifierService.showNotification(
            'Endereço criado.',
            'Sucesso',
            'success'
          );
        }
      })
      .catch((result) => {
        this.store.dispatch(closePreloader());
        this.notifierService.showNotification(
          result.errors[0].message,
          result.errors[0].code,
          'error'
        );
      });
    this.formDirective.resetForm();
    this.cancelAddress();
  }

  updateAddress(endereco: CriarEnderecoRequest) {
    this.empresasService
      .atualizarEmpresasEndereco(this.companyId, this.addressId, endereco)
      .toPromise()
      .then((result) => {
        if (result.errors) {
          this.notifierService.showNotification(
            result.errors[0].message,
            result.errors[0].code,
            'error'
          );
          this.store.dispatch(closePreloader());
          return;
        }
        this.store.dispatch(closePreloader());
        this.notifierService.showNotification(
          'Endereço atualizado.',
          'Sucesso',
          'success'
        );
        this.getCompanyAddresses();
        this.store.dispatch(closePreloader());
      })
      .catch((result) => {
        this.notifierService.showNotification(
          result.errors[0].message,
          result.errors[0].code,
          'error'
        );
        this.store.dispatch(closePreloader());
      });
    this.cancelAddress();
  }

  addAddress() {
    this.toggleEdition();
  }

  cancelAddress() {
    this.addressId = null;
    this.addressForm.reset();
    this.toggleEdition();
  }

  toggleEdition() {
    this.isEdition = !this.isEdition;
  }

  openDialog(enderecoId: number): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: { descricao: 'Deseja excluir este endereço? ' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'delete') {
        this.deleteEndereco(enderecoId);
      }
    });
  }

  deleteEndereco(enderecoId) {
    this.store.dispatch(showPreloader({ payload: '' }));

    this.empresasService
      .deleteEndereco(this.companyId, enderecoId)
      .toPromise()
      .then((result) => {
        this.notifierService.showNotification(
          'Endereço excluído.',
          'Sucesso',
          'success'
        );
        this.getCompanyAddresses();
        this.store.dispatch(closePreloader());
      })
      .catch((e) => {
        console.info(e);
      });
  }

  goToNextStep(stepNumber: number) {
    this.nextStep.emit(stepNumber);
  }

  // Utility
  obterEnderecoPorCep(cep: string) {
    this.municipioCep = null;
    if (cep == undefined) return;

    this.findingAddress = true;

    this.disableEnableFields(true);

    this.geograficoService
      .obterEnderecoPorCep(cep)
      .subscribe((endereco: EnderecoResponse) => {
        if (endereco.isSuccessful) {
          endereco.endereco.logradouro && this.addressForm.get('logradouro').setValue(endereco.endereco.logradouro);
          endereco.endereco.bairro && this.addressForm.get('bairro').setValue(endereco.endereco.bairro);
          endereco.endereco.uf && this.addressForm.get('uf').setValue(endereco.endereco.uf);
          Utility.waitFor(() => {
            this.addressForm
              .get('municipio')
              .setValue(endereco.endereco.localidade);
            this.addressForm
              .get('municipioId')
              .setValue(this.municipiosFiltrados[0]?.id);
          }, 3000);
          this.findingAddress = false;
          this.isInvalidCep = false;
          this.disableEnableFields();
          return;
        }
        this.disableEnableFields();
        this.findingAddress = false;
        this.isInvalidCep = true;
      });
  }

  disableEnableFields(disable: boolean = false) {
    const fields = ['logradouro', 'bairro', 'municipio', 'uf'];
    if (disable) {
      fields.forEach(field => this.addressForm.get(field)?.disable());
    } else {
      this.addressForm.enable();
    }
  }

  // load dropdown
  getEstados() {
    this.geograficoService.obterUfs().subscribe((result) => {
      this.estados = result.ufs;
    });
  }
}
