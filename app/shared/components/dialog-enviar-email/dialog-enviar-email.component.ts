import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatLegacyChipInputEvent as MatChipInputEvent } from '@angular/material/legacy-chips';
import { Utility } from 'src/app/core/common/utility';
import { Observable } from 'rxjs';
import { MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent } from '@angular/material/legacy-autocomplete';
import { Permissoes } from 'src/app/core/common/permissoes';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { map, startWith } from 'rxjs/operators';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Empresas } from 'src/app/modules/sistemas/sub-modules/crm/core/models/empresas/empresas.model';
import { chipsEmailModel } from 'src/app/modules/sistemas/sub-modules/crm/core/models/empresas/chips-email-model';
import { ObterEmpresasGrupoRequest } from 'src/app/modules/sistemas/sub-modules/crm/core/requests/empresas/obter-empresas-grupo.request';
import { UsuarioEmpresaFiltro } from 'src/app/modules/sistemas/sub-modules/crm/core/models/usuarios-empresa/usuario-empresa-filtro.model';
import { EmpresasService } from 'src/app/modules/sistemas/sub-modules/crm/services/empresas.service';
import { UsuariosEmpresaService } from 'src/app/modules/sistemas/sub-modules/crm/services/usuarios-empresa.service';

@Component({
  selector: 'app-dialog-enviar-email',
  templateUrl: './dialog-enviar-email.component.html',
  styleUrls: ['./dialog-enviar-email.component.scss']
})
export class DialogEnviarEmailComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  empresaId: number = null;
  texto: string;
  empresas: Empresas[] = [];
  empresasFiltradas: Empresas[] = [];

  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredUsuarios: Observable<chipsEmailModel[]>;
  usuarios: chipsEmailModel[] = [];
  allUsuarios: chipsEmailModel[] = [];
  usuariosControl: FormControl = new FormControl();
  showUsuariosChip: boolean = false;

  empresaSelecionada: number = null;

  formulario = this.fb.group({
    empresaNome: [null, Validators.required],
    empresaId: [null, Validators.required],
    usuarios: [null, Validators.required]
  });

  @ViewChild('usuarioInput') usuarioInput: ElementRef<HTMLInputElement>;

  constructor(private fb: UntypedFormBuilder,
    private notifierService: NotifierService,
    private dialogService: DialogCustomService,
    private empresaService: EmpresasService,
    private usuariosService: UsuariosEmpresaService,
    @Inject(MAT_DIALOG_DATA) public data) {
    this.filteredUsuarios = this.usuariosControl.valueChanges.pipe(
      startWith(null),
      map((usuario: string | null) => (usuario ? this._filter(usuario) : this.allUsuarios.slice(0, 10))),
    );

    this.texto = this.data.texto;
    this.empresaId = this.data.empresaId;
  }

  ngOnInit(): void {
    this.dialogService.setDialogData("nodata");
    this.carregarEmpresas();

    this.formulario.statusChanges.subscribe((s) => {
      Utility.waitFor(() => {
        if (s == 'VALID') {
          this.dialogService.setDialogData({ dataType: 'relatorios-email', data: { empresaId: this.formulario.get('empresaId').value, usuarios: this.formulario.get('usuarios').value } });
        } else {
          this.dialogService.setDialogData("nodata");
        }
      }, 1000)
    });

    this.formulario.get('empresaId').valueChanges.subscribe(value => {
      this.usuarioInput.nativeElement.value = '';
      this.formulario.get('usuarios').reset();
      this.usuariosControl.reset();
      this.usuarios = [];
    })
  }

  selectable = false;
  removable = true;
  addOnBlur = false;
  emails: Array<string> = [];

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
    this.empresaService.obterEmpresasDoGrupo(<ObterEmpresasGrupoRequest>{ empresaId: this.empresaId }).subscribe(response => {
      if (response.isSuccessful) {
        this.empresas = response.empresas;
        this.formatarEmpresas(response.empresas);
      }
    });
  }

  selecionaEmpresaId() {
    let empresaSelecionada = this.formulario.get('empresaNome').value;
    if (!empresaSelecionada) {
      this.formulario.get('empresaId').reset();
      return;
    }

    let empresaTxt = this.formulario.get('empresaNome').value.split(' - ');
    let cnpj = this.formulario.get('empresaNome').value.split(' - ')[empresaTxt.length - 1];

    if (!cnpj) {
      this.formulario.get('empresaId').reset();
      return;
    }

    let empresaCnpj = this.empresas.filter(e => Utility.checkNumbersOnly(e.cnpj).indexOf(Utility.checkNumbersOnly(cnpj)) > -1)[0];
    if (!empresaCnpj) {
      this.formulario.get('empresaId').reset();
      return;
    }

    this.formulario.get('empresaId').setValue(empresaCnpj.id);
    this.carregarUsuarios(this.formulario.get('empresaId').value);
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
    this.formulario.get('usuarios').setValue(this.usuarios?.map(usuario => usuario.email));
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
