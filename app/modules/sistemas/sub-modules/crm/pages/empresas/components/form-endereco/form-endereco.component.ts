import { Component, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { CriarEnderecoRequest } from '../../../../core/requests/empresas/criar-endereco.request';
import { EmpresasService } from '../../../../services/empresas.service';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { GeograficoService } from '../../../../services/geografico.service';
import { EnderecoResponse } from '../../../../core/responses/geograficos/endereco.response';

import { Store } from '@ngrx/store';
import { SubSink } from 'subsink';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Municipio } from '../../../../core/models/geograficos/municipio.model';
import { Utility } from 'src/app/core/common/utility';
import { MunicipioResponse } from '../../../../core/responses/geograficos/municipio.response';
import { Uf } from '../../../../core/models/geograficos/uf.model';
import { Permissoes } from 'src/app/core/common/permissoes';

@Component({
  selector: 'app-form-endereco',
  templateUrl: './form-endereco.component.html',
  styleUrls: ['./form-endereco.component.scss'],
})
export class FormEnderecoComponent implements OnInit, OnChanges, OnDestroy {

  utility = Utility;
  Permissoes = Permissoes;

  @Output() submitEndereco: EventEmitter<any> = new EventEmitter();
  @Input() empresaId: number;
  @Input() editEndereco;
  @Input() hasEnderecos: boolean = false;
  @Input() isCreate: boolean = true;
  loading: boolean = false;
  cep$ = new Subject<string>();
  cepInvalido: boolean = false;
  municipiosFiltrados: Municipio[] = [];
  municipios: Municipio[] = [];
  municipioCep: string = null;
  ufs: Uf[] = [];
  private subscriptions = new SubSink();
  private changeCep: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private empresasService: EmpresasService,
    private notifierService: NotifierService,
    private store: Store<{ preloader: IPreloaderState }>,
    private geograficoService: GeograficoService
  ) {
    if (this.activatedRoute.snapshot.params['empresaId'] != undefined) {
      this.empresaId = this.activatedRoute.snapshot.params['empresaId'];
    }
  }

  createEnderecoForm = this.formBuilder.group({
    cep: ['', Validators.required],
    logradouro: ['', Validators.required],
    numero: ['', Validators.required],
    bairro: ['', Validators.required],
    complemento: [''],
    cidade: ['', Validators.required],
    uf: ['', Validators.required],
    principal: false,
    municipioId: ['', Validators.required]
  });

  ngOnInit() {
    if (!Utility.getPermission([Permissoes.GESTAO_EMPRESA_CADASTRAR])) {
      Utility.modoConsulta(this.createEnderecoForm);
    }

    this.createEnderecoForm.get('cep').valueChanges
      .pipe(debounceTime(2000))
      .subscribe((cep: string) => this.cep$.next(cep))

    this.subscriptions.add(
      this.cep$.subscribe(data => {
        if (this.changeCep && data !== '') this.obterEnderecoPorCep(data)
        this.changeCep = true;
      }));

    this.carregarUfs();

    this.createEnderecoForm.get('uf').valueChanges
      .subscribe((value: string) => {
        if (!Utility.isNullOrEmpty(value)) {
          this.filtrarMunicipio(value);
          this.createEnderecoForm.get('cidade').enable();
          return;
        }

        this.createEnderecoForm.get('cidade').reset();
        this.createEnderecoForm.get('cidade').disable();
      });

    this.createEnderecoForm.get('cidade').valueChanges
      .subscribe((item: string) => {
        this.filterData(item);
      });
  }

  onChangeCidade() {
    if (this.createEnderecoForm != null && !Utility.isNullOrEmpty(this.createEnderecoForm.get('cidade').value)) {
      Utility.waitFor(() => {
        this.createEnderecoForm.get('cidade').setValidators(Validators.compose([Validators.required, Utility.dynamicValidator(() => { return this.validaCidade(this.createEnderecoForm.get('cidade').value) }, 'cidadeInvalida')]));
        this.createEnderecoForm.get('cidade').updateValueAndValidity();
        this.createEnderecoForm.get('cidade').markAllAsTouched();
      }, 1000);
    }
  }

  ngOnChanges() {
    // create/update endereço
    if (!this.editEndereco) {
      this.createEnderecoForm.patchValue({
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        complemento: '',
        cidade: '',
        uf: '',
        principal: false,
        municipioId: ''
      })

      if (!this.hasEnderecos) {
        this.createEnderecoForm.controls['principal'].setValue(true);
        this.createEnderecoForm.controls['principal'].disable();
      } else {
        this.createEnderecoForm.controls['principal'].setValue(false);
        this.createEnderecoForm.controls['principal'].enable();
      }

    } else {
      this.createEnderecoForm.patchValue({
        cep: this.editEndereco.endereco.cep,
        logradouro: this.editEndereco.endereco.logradouro,
        numero: this.editEndereco.endereco.numero,
        bairro: this.editEndereco.endereco.bairro,
        complemento: this.editEndereco.endereco.complemento,
        cidade: this.editEndereco.endereco.municipio,
        uf: this.editEndereco.endereco.uf,
        principal: this.editEndereco.enderecoPrincipal,
        municipioId: this.editEndereco.endereco.municipioId
      });

      this.filtrarMunicipio(this.editEndereco.endereco.uf);

      this.createEnderecoForm.controls['principal'].enable();

      if (this.createEnderecoForm.controls['principal'].value) {
        this.createEnderecoForm.controls['principal'].disable();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  onSubmit() {
    let endereco = <CriarEnderecoRequest>{
      logradouro: this.createEnderecoForm.get('logradouro').value,
      numero: this.createEnderecoForm.get('numero').value,
      complemento: this.createEnderecoForm.get('complemento').value,
      bairro: this.createEnderecoForm.get('bairro').value,
      municipio: this.createEnderecoForm.get('cidade').value,
      cep: this.createEnderecoForm.get('cep').value,
      uf: this.createEnderecoForm.get('uf').value,
      enderecoPrincipal: this.createEnderecoForm.get('principal').value,
      municipioId: this.createEnderecoForm.get('municipioId').value
    };

    this.store.dispatch(showPreloader({ payload: '' }))

    if (!this.editEndereco) {
      this.empresasService.criarEmpresaEndereco(this.empresaId, endereco).toPromise().then(
        result => {
          if (result.empresaId) {
            this.submitEndereco.emit(result.endereco)
            this.store.dispatch(closePreloader())
            this.notifierService.showNotification('Endereço criado.', 'Sucesso', 'success')
            return;
          }
        },
      ).catch(
        result => {
          this.notifierService.showNotification(result.errors[0].message, result.errors[0].code, 'error');
          this.store.dispatch(closePreloader())
        }
      )
      return
    }
    this.empresasService.atualizarEmpresasEndereco(this.empresaId, this.editEndereco.id, endereco)
      .toPromise().then(result => {
        if (result.errors) {
          this.notifierService.showNotification(result.errors[0].message, result.errors[0].code, 'error');
          this.store.dispatch(closePreloader())
          return;
        }

        this.submitEndereco.emit(result.endereco)
        this.store.dispatch(closePreloader())
        this.notifierService.showNotification(
          'Endereço atualizado.',
          'Sucesso',
          'success'
        );
        this.store.dispatch(closePreloader())

      }).catch(result => {
        this.notifierService.showNotification(result.errors[0].message, result.errors[0].code, 'error');
        this.store.dispatch(closePreloader())
      })
  }

  validaCidade(cidade: string) {
    if (Utility.isNullOrEmpty(cidade)) return;

    const valueInput = cidade.toLowerCase();

    this.municipiosFiltrados = this.municipios.filter(municipio => municipio.nome.toLowerCase() === valueInput);
    if (this.municipiosFiltrados.length == 1) {
      this.createEnderecoForm.get('municipioId').setValue(this.municipiosFiltrados[0].id);
      return true;
    }
    
    return false;
  }

  obterEnderecoPorCep(cep: string) {
    this.municipioCep = null;
    if (cep == undefined) return

    this.loading = true

    this.geograficoService.obterEnderecoPorCep(cep)
      .subscribe((endereco: EnderecoResponse) => {
        if (endereco.isSuccessful) {
          this.createEnderecoForm.get('logradouro').setValue(endereco.endereco.logradouro);
          this.createEnderecoForm.get('bairro').setValue(endereco.endereco.bairro);
          this.createEnderecoForm.get('uf').setValue(endereco.endereco.uf);
          this.createEnderecoForm.get('cidade').setValue(endereco.endereco.municipioResponse.nome);
          this.createEnderecoForm.get('municipioId').setValue(endereco.endereco.municipioResponse.id);
          this.loading = false;
          this.cepInvalido = false
          return
        }

        this.loading = false
        this.cepInvalido = true
      })
  }

  private filtrarMunicipio(uf: string) {
    if (uf != undefined) {
      this.geograficoService.obterMunicipiosPorUf(uf)
        .subscribe((municipios: MunicipioResponse) => {
          this.municipios = municipios.municipios;
        })
    }
  }

  private filterData(value: string) {
    this.createEnderecoForm.get('municipioId').reset();

    if (value != undefined) {
      const valueInput = value.toLocaleLowerCase();
      this.municipiosFiltrados = this.municipios?.filter((item: Municipio) => {
        return item.nome.toLowerCase().indexOf(valueInput.toLowerCase()) > -1
      });

      if (this.municipiosFiltrados.length > 0) {
        let municipioSelecionado = this.municipiosFiltrados.filter(municipio => municipio.nome.toLocaleLowerCase() === valueInput);
        if (municipioSelecionado.length == 1) {
          this.createEnderecoForm.get('municipioId').setValue(municipioSelecionado[0].id);
        }
      }
    }
  }

  private carregarUfs() {
    this.geograficoService.obterUfs().subscribe(result => { this.ufs = result.ufs; })
  }

  onCancelar() {
    this.submitEndereco.emit(false);
  }
}
