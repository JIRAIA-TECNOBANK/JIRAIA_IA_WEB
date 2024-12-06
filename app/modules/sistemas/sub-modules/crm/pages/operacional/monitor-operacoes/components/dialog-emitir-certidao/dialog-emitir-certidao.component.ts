import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { UntypedFormBuilder, FormControl, Validators } from '@angular/forms';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Utility } from 'src/app/core/common/utility';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { chipsEmailModel } from '../../../../../core/models/empresas/chips-email-model';
import { Empresas } from '../../../../../core/models/empresas/empresas.model';
import { MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent } from '@angular/material/legacy-autocomplete';
import { MatLegacyChipInputEvent as MatChipInputEvent } from '@angular/material/legacy-chips';
import { EmpresasService } from '../../../../../services/empresas.service';
import { UsuariosEmpresaService } from '../../../../../services/usuarios-empresa.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { ObterEmpresasGrupoRequest } from '../../../../../core/requests/empresas/obter-empresas-grupo.request';
import { UsuarioEmpresaFiltro } from '../../../../../core/models/usuarios-empresa/usuario-empresa-filtro.model';

@Component({
  selector: 'app-dialog-emitir-certidao',
  templateUrl: './dialog-emitir-certidao.component.html',
  styleUrls: ['./dialog-emitir-certidao.component.scss']
})
export class DialogEmitirCertidaoComponent implements OnInit {

  utility = Utility;
  activeTab: string = 'baixar';

  formBaixar = this.formBuilder.group({
    tipoCertidao: null,
    tipoEnvio: 1,
  });

  formEmail = this.formBuilder.group({
    tipoCertidao: [null, Validators.required],
    tipoEnvio: [2, Validators.required],
    solicitacao: null,
    emailDestinatario: [null, Validators.required],
    empresaNome: [null, Validators.required],
    empresaId: [null, Validators.required],
  });

  @ViewChild('usuarioInput') usuarioInput: ElementRef<HTMLInputElement>;

  empresaDocumento: string = null;
  empresas: Empresas[] = [];
  empresasFiltradas: Empresas[] = [];

  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredUsuarios: Observable<chipsEmailModel[]>;
  usuarios: chipsEmailModel[] = [];
  allUsuarios: chipsEmailModel[] = [];
  usuariosControl: FormControl = new FormControl();
  showUsuariosChip: boolean = false;

  empresaSelecionada: number = null;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private dialogService: DialogCustomService,
    private empresaService: EmpresasService,
    private usuariosService: UsuariosEmpresaService,
    private notifierService: NotifierService,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.filteredUsuarios = this.usuariosControl.valueChanges.pipe(
      startWith(null),
      map((usuario: string | null) => (usuario ? this._filter(usuario) : this.allUsuarios.slice(0, 10))),
    );

    this.empresaDocumento = this.data.empresaDocumento;
  }

  ngOnInit(): void {
    this.dialogService.setDialogData('nodata');
    this.checkFormValidity();
    this.carregarEmpresas();

    this.formEmail.get('empresaId').valueChanges.subscribe(value => {
      this.usuarioInput.nativeElement.value = '';
      this.formEmail.get('emailDestinatario').reset();
      this.usuariosControl.reset();
      this.usuarios = [];
    })
  }

  selectable = false;
  removable = true;
  addOnBlur = false;

  checkFormValidity() {
    this.formEmail.valueChanges.pipe(debounceTime(1000)).subscribe((res) => {
      if (this.activeTab !== 'baixar') {
        if (this.formEmail.valid) {
          this.dialogService.setDialogData({
            dataType: 'certidao',
            tipoCertidao: this.formEmail.get('tipoCertidao').value,
            tipoEnvio: 2,
            emailDestinatario: this.formEmail.get('emailDestinatario').value,
            solicitacao: this.formEmail.get('solicitacao').value,
          });
        } else {
          this.dialogService.setDialogData('nodata');
        }
      }
    });

    this.formBaixar.valueChanges.subscribe((res) => {
      if (this.activeTab === 'baixar') {
        if (this.formBaixar.valid) {
          this.dialogService.setDialogData({
            dataType: 'certidao',
            tipoCertidao: this.formBaixar.get('tipoCertidao').value,
            tipoEnvio: 1,
          });
        } else {
          this.dialogService.setDialogData('nodata');
        }
      }
    });
  }

  changeTab(event) {
    this.activeTab = event.tab.textLabel;
    if (this.activeTab == 'baixar') {
      this.formEmail.reset();
      this.dialogService.setDialogData('nodata');
      if (this.formBaixar.valid) {
        this.dialogService.setDialogData({
          tipoCertidao: this.formBaixar.get('tipoCertidao').value,
          tipoEnvio: 1,
        });
      }
    } else {
      this.formBaixar.reset();
      this.dialogService.setDialogData('nodata');
      if (this.formEmail.valid) {
        this.dialogService.setDialogData({
          tipoCertidao: this.formEmail.get('tipoCertidao').value,
          tipoEnvio: 2,
          emailDestinatario: this.formEmail.get('emailDestinatario').value.join(','),
          solicitacao: this.formEmail.get('solicitacao').value,
        });
      }
    }
  }

  filtrarEmpresas(filtro: string = null) {
    if (filtro) {
      if (filtro.length >= 3) {
        const value = Utility.checkNumbersOnly(filtro);
        if (value.length >= 3) {
          const listaEmpresas = this.empresas;

          if (!isNaN(+value)) {
            this.empresasFiltradas = listaEmpresas.filter(empresa => Utility.checkNumbersOnly(empresa.cnpj).startsWith(value)).slice(0, 10);
            return;
          }

          this.empresasFiltradas = listaEmpresas.filter(empresa => empresa.nomeFantasia.toLocaleLowerCase().startsWith(value)).slice(0, 10);
          return;
        }
      }
    }

    this.empresasFiltradas = this.empresas.slice(0, 10);
  }

  carregarEmpresas() {
    this.empresaService.obterEmpresasDoGrupo(<ObterEmpresasGrupoRequest>{ cnpj: this.empresaDocumento }).subscribe(response => {
      if (response.isSuccessful) {
        this.empresas = response.empresas;
        this.formatarEmpresas(response.empresas);
      }
    });
  }

  selecionaEmpresaId() {
    let empresaSelecionada = this.formEmail.get('empresaNome').value;
    if (!empresaSelecionada) {
      this.formEmail.get('empresaId').reset();
      return;
    }

    let empresaTxt = this.formEmail.get('empresaNome').value.split(' - ');
    let cnpj = this.formEmail.get('empresaNome').value.split(' - ')[empresaTxt.length - 1];

    if (!cnpj) {
      this.formEmail.get('empresaId').reset();
      return;
    }

    let empresaCnpj = this.empresas.filter(e => Utility.checkNumbersOnly(e.cnpj).indexOf(Utility.checkNumbersOnly(cnpj)) > -1)[0];
    if (!empresaCnpj) {
      this.formEmail.get('empresaId').reset();
      return;
    }

    this.formEmail.get('empresaId').setValue(empresaCnpj.id);
    this.carregarUsuarios(this.formEmail.get('empresaId').value);
  }

  carregarUsuarios(empresaId: number) {
    this.allUsuarios = [];
    this.usuariosControl.reset();
    this.usuariosService.obterUsuarios(empresaId, 0, 200, 'primeiroNome.asc', <UsuarioEmpresaFiltro>{ status: true }).subscribe(response => {
      if (response.usuarios) {
        this.showUsuariosChip = true;
        response.usuarios.forEach(usuario => {
          this.allUsuarios.push(<chipsEmailModel>{ nome: usuario.nomeCompleto, email: usuario.email, usuarioId: usuario.id });
          this.usuariosControl.reset();
        });
        return;
      }
      this.notifierService.showNotification('Esta empresa não possui usuários!', '', 'warning');
    });
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    let selected = this.allUsuarios.filter(usuario => usuario.nome == value)[0];
    if (!selected || this.usuarios.indexOf(selected) != -1) return;

    if (value) { this.usuarios.push(selected); }

    event.chipInput!.clear();
    this.usuariosControl.setValue(null);
    this.setFormEmails();
  }

  remove(usuario: chipsEmailModel): void {
    const index = this.usuarios.indexOf(usuario);

    if (index >= 0) { this.usuarios.splice(index, 1); }
    this.setFormEmails();
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    let selected = this.allUsuarios.filter(usuario => usuario.nome == event.option.value)[0];
    if (!selected || this.usuarios.indexOf(selected) != -1) return;

    this.usuarios.push(selected);
    this.usuarioInput.nativeElement.value = '';
    this.usuariosControl.setValue(null);
    this.setFormEmails();
  }

  setFormEmails() {
    this.formEmail.get('emailDestinatario').setValue(this.usuarios?.map(usuario => usuario.email));
  }

  private _filter(value: string): chipsEmailModel[] {
    const filterValue = value.toLowerCase();
    return this.allUsuarios.filter(usuario => usuario.nome.toLowerCase().includes(filterValue));
  }

  public verifyUsuarioAdicionado(usuario: chipsEmailModel): boolean {
    return this.usuarios.filter(u => u.email == usuario.email).length > 0;
  }

  private formatarEmpresas(empresas: Empresas[]) {
    let empresasLista = empresas;
    empresasLista.forEach(empresa => { empresa.cnpj = Utility.formatCnpj(empresa.cnpj) });
    this.empresasFiltradas = empresasLista.slice(0, 10);
  }
}
