import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { CriarUsuarioEmpresaRequest } from '../../../../core/requests/empresas/criar-usuario-empresa.request';
import { EmpresasService } from '../../../../services/empresas.service';
import { UsuariosEmpresaService } from '../../../../services/usuarios-empresa.service';

import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Store } from '@ngrx/store';
import { pairwise } from 'rxjs';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { LiberarInformacoesTela } from 'src/app/core/enums/liberar-informacoes-tela.enum';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { LiberarAcessos } from 'src/app/modules/sistemas/core/models/common/liberar-acessos.model';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { Cargos } from '../../../../core/models/empresas/cargos.model';
import { Departamentos } from '../../../../core/models/empresas/departamentos.model';
import { PerfisFiltro } from '../../../../core/models/perfis/perfis-filtro.model';
import { UsuarioEmpresa } from '../../../../core/models/usuarios-empresa/usuario-empresa.model';
import { CriarCargoRequest } from '../../../../core/requests/empresas/criar-cargo.request';
import { CriarDepartamentoRequest } from '../../../../core/requests/empresas/criar-departamento.request';
import { NotificacaoService } from '../../../../services/notificacao.service';
import { PerfisService } from '../../../../services/perfis.service';
import { DialogUsuarioExistenteComponent } from '../../components/dialog-usuario-existente/dialog-usuario-existente.component';

@Component({
  selector: 'app-criar-usuario',
  templateUrl: './criar-usuario.component.html',
  styleUrls: ['./criar-usuario.component.scss'],
})
export class CriarUsuarioComponent implements OnInit {

  Permissoes = Permissoes;
  utility = Utility;

  createUsuarioForm = this.formBuilder.group({
    nome: '',
    sobrenome: '',
    email: ['', Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")],
    confirmacaoEmail: ['', Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")],
    cpf: '',
    cpfAnonimizado: [{ value: null, disabled: true }, Validators.nullValidator],
    telefone: '',
    ramal: '',
    perfil: '',
    departamento: '',
    cargo: '',
    ativo: true,
    recebeComunicados: false,
    novoDepartamento: [null],
    novoCargo: [null],
    notificaFaturamento: [false]
  });

  perfis;
  departamentos: Departamentos[];
  cargos: Cargos[];

  usuarioModel: UsuarioEmpresa = null;

  empresaId: number;
  usuarioGuid: string = null;

  emailVerificado: boolean = false;
  anonimizar: boolean = false;

  habilitarNotificacaoFaturamento: boolean = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private usuariosEmpresaService: UsuariosEmpresaService,
    private empresaService: EmpresasService,
    private notifierService: NotifierService,
    private activatedRoute: ActivatedRoute,
    private store: Store<{ preloader: IPreloaderState }>,
    public dialog: MatDialog,
    private notificacaoService: NotificacaoService,
    private perfilService: PerfisService
  ) {
    this.empresaId = +this.activatedRoute.parent.params['_value']['empresaId'];
    this.usuarioGuid = this.activatedRoute.snapshot.params['usuarioGuid'];
  }

  ngOnInit(): void {
    if (!Utility.getPermission([Permissoes.GESTAO_EMPRESA_USUARIO_CRM_CADASTRAR])) {
      Utility.modoConsulta(this.createUsuarioForm);
    }

    this.carregarDepartamentos();
    this.carregarCargos();
    this.carregarPerfis();

    if (this.usuarioGuid != null) {
      this.store.dispatch(showPreloader({ payload: '' }));
      Utility.waitFor(() => { this.carregarUsuario(); }, 5000);
    }
    else { this.desabilitaCampos(); }

    this.createUsuarioForm.controls.cargo.valueChanges.subscribe(value => {
      if (value > 0) {
        if (!this.novoCargo(value)) {
          Utility.changeFieldValidators(this.createUsuarioForm, 'novoCargo', [Validators.nullValidator])
        }
      }
    })

    this.createUsuarioForm.controls.departamento.valueChanges.subscribe(value => {
      if (value > 0) {
        if (!this.novoDepartamento(value)) {
          Utility.changeFieldValidators(this.createUsuarioForm, 'novoDepartamento', [Validators.nullValidator])
        }
      }
    })

    this.createUsuarioForm.get('perfil')?.valueChanges.pipe(pairwise()).subscribe(([prev, next]) => {
      if (prev === next) return;
      if (next) this.verificalPermissoesPerfil(next);
    });
  }

  submitUsuario() {
    let usuario = <CriarUsuarioEmpresaRequest>{
      primeiroNome: this.createUsuarioForm.get('nome').value,
      sobrenome: this.createUsuarioForm.get('sobrenome').value,
      telefone: this.createUsuarioForm.get('telefone').value,
      ramal: this.createUsuarioForm.get('ramal').value,
      documento: this.createUsuarioForm.get('cpf').value,
      email: this.createUsuarioForm.get('email').value,
      ehMaster: false,
      perfilId: this.createUsuarioForm.get('perfil').value,
      departamentoId: this.createUsuarioForm.get('departamento').value,
      cargoId: this.createUsuarioForm.get('cargo').value,
      ativo: this.createUsuarioForm.get('ativo').value,
      recebeComunicados: this.createUsuarioForm.get('recebeComunicados').value,
      empresaId: this.empresaId,
      notificaFaturamento: this.createUsuarioForm.get('notificaFaturamento').value
    };

    this.store.dispatch(showPreloader({ payload: '' }))

    if (this.usuarioGuid == undefined) {
      this.criarUsuario(usuario);
      return;
    }

    this.atualizarUsuario(usuario);
  }

  private criarUsuario(usuario: CriarUsuarioEmpresaRequest) {
    this.usuariosEmpresaService.criarUsuarioEmpresa(usuario)
      .subscribe(result => {
        if (result.errors) {
          this.notifierService.showNotification(result.errors[0].message, result.errors[0].code, 'error');
          this.store.dispatch(closePreloader())
          return;
        }

        this.store.dispatch(closePreloader())
        this.notifierService.showNotification(
          'Usuário criado.',
          'Sucesso',
          'success'
        );
        this.store.dispatch(closePreloader())
        this.router.navigate(['../../', this.empresaId], {
          relativeTo: this.activatedRoute,
        });
      },
        error => { this.store.dispatch(closePreloader()) }
      );
  }

  private atualizarUsuario(usuario: CriarUsuarioEmpresaRequest) {
    this.usuariosEmpresaService.atualizarUsuario(this.usuarioGuid, usuario)
      .subscribe(result => {
        if (result) {
          if (result.errors) {
            this.notifierService.showNotification(result.errors[0].message, result.errors[0].code, 'error');
            this.store.dispatch(closePreloader())
            return;
          }

          if (this.usuarioModel.ativo == usuario.ativo) {
            this.atualizaUsuarioSucesso();
            return;
          }

          this.ativarInativarUsuario(usuario);
        }
      }, error => { this.store.dispatch(closePreloader()) });
  }

  ativarInativarUsuario(usuario: CriarUsuarioEmpresaRequest) {
    if (this.usuarioModel.ativo != usuario.ativo) {
      if (usuario.ativo) {
        this.usuariosEmpresaService.ativarUsuario(this.usuarioGuid).toPromise()
          .then(result => {
            if (result.usuarioGuid != null) {
              this.atualizaUsuarioSucesso();
              return;
            }

            this.notifierService.showNotification(result.errors[0].message, result.errors[0].code, 'error');
            this.store.dispatch(closePreloader())
          })
          .catch(error => {
            this.notifierService.showNotification(error.error.errors[0].message, error.error.errors[0].code, 'error');
            this.store.dispatch(closePreloader())
          })
      }
      else {
        this.usuariosEmpresaService.inativarUsuario(this.usuarioGuid).toPromise()
          .then(result => {
            if (result.usuarioGuid != null) {
              this.atualizaUsuarioSucesso();
              return;
            }

            this.notifierService.showNotification(result.errors[0].message, result.errors[0].code, 'error');
            this.store.dispatch(closePreloader())
          })
          .catch(error => {
            this.notifierService.showNotification(error.error.errors[0].message, error.error.errors[0].code, 'error');
            this.store.dispatch(closePreloader())
          })
      }
    }
  }

  atualizaUsuarioSucesso() {
    this.store.dispatch(closePreloader())
    this.notifierService.showNotification(
      'Usuário atualizado.',
      'Sucesso',
      'success'
    );
    this.store.dispatch(closePreloader())
    this.router.navigate(['../../../', this.empresaId], {
      relativeTo: this.activatedRoute,
    });
  }

  carregarDepartamentos() {
    this.empresaService.obterDepartamentos(this.empresaId).subscribe(result => {
      this.departamentos = result.departamentos;
    })
  }

  carregarCargos() {
    this.empresaService.obterCargos(this.empresaId).subscribe(result => {
      this.cargos = result.cargos;
    })
  }

  carregarPerfis() {
    let filtro: PerfisFiltro = <PerfisFiltro>{ pageIndex: 0, pageSize: 50, status: true };

    this.empresaService
      .obterPerfis(this.empresaId, filtro)
      .subscribe((result) => {
        this.perfis = result.perfis;
      });
  }

  carregarUsuario() {
    this.emailVerificado = true;
    this.anonimizar = true;

    this.usuariosEmpresaService.obterUsuarioPorGuid(this.usuarioGuid, this.empresaId).subscribe(result => {
      if (result.id) {
        this.usuarioModel = <UsuarioEmpresa>{
          id: result.id,
          perfil: result.perfil,
          usuarioGuid: result.usuarioGuid,
          primeiroNome: result.primeiroNome,
          sobrenome: result.sobrenome,
          nomeCompleto: result.nomeCompleto,
          email: result.email,
          ativo: result.ativo,
          recebeComunicados: result.recebeComunicados,
          criadoEm: result.criadoEm,
          modificadoEm: result.modificadoEm,
          notificaFaturamento: result.notificaFaturamento
        };

        this.createUsuarioForm.setValue({
          nome: result.primeiroNome,
          sobrenome: result.sobrenome,
          email: result.email,
          confirmacaoEmail: result.email,
          cpf: result.documento,
          cpfAnonimizado: result.documento,
          telefone: result.telefone,
          ramal: result.ramal,
          perfil: result.perfil.id,
          departamento: result.departamentoId,
          cargo: result.cargoId,
          ativo: result.ativo,
          recebeComunicados: result.recebeComunicados,
          novoDepartamento: null,
          novoCargo: null,
          notificaFaturamento: result.notificaFaturamento || false
        });

        this.verificalPermissoesPerfil(result.perfil.id, result.notificaFaturamento);
      }

      this.store.dispatch(closePreloader())
    });
  }

  novoDepartamento(departamentoId) {
    return this.departamentos?.filter(departamento => departamento.id == departamentoId)[0]?.nome == 'Outros';
  }

  novoCargo(cargoId) {
    return this.cargos?.filter(departamento => departamento.id == cargoId)[0]?.nome == 'Outros';
  }

  adicionarDepartamento(value) {
    this.empresaService.criarDepartamento(this.empresaId, <CriarDepartamentoRequest>{ nome: value }).subscribe(result => {
      if (result.departamentoId) {
        this.carregarDepartamentos();
        this.createUsuarioForm.get('departamento').setValue(result.departamentoId);
      }
    })
  }

  adicionarCargo(value) {
    this.empresaService.criarCargo(this.empresaId, <CriarCargoRequest>{ nome: value }).subscribe(result => {
      if (result.cargoId) {
        this.carregarCargos();
        this.createUsuarioForm.get('cargo').setValue(result.cargoId);
      }
    })
  }

  goBack() {
    if (this.usuarioGuid) {
      this.router.navigate(['../../'], {
        relativeTo: this.activatedRoute,
      });
    } else {
      this.router.navigate(['../'], {
        relativeTo: this.activatedRoute,
      });
    }
  }

  verificaEmail(email) {
    this.emailVerificado = false;

    this.usuariosEmpresaService.obterUsuarioPorEmail(email).subscribe(response => {
      this.emailVerificado = true;

      if (response.id && this.usuarioGuid !== response.usuarioGuid) {
        let erro = 'emailExistenteNaEmpresa';

        if (response.empresa == null
          || response.empresa.id !== this.empresaId) {
          erro = 'usuarioExistente';

          let mensagem = response.mensagemModal ?? `<p>O e-mail informado já se encontra cadastrado em outro grupo econômico.</p> <p>Para prosseguir com a transferência dos dados para esse novo cadastro clique em CONFIRMAR ou DESISTIR para sair.</p>`;
          this.mostrarMensagem(mensagem, response.usuarioGuid);
        }

        this.createUsuarioForm.get('email').setValidators(
          Validators.compose([
            Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"),
            Validators.required,
            Utility.dynamicValidator(() => { return response.id == undefined; }, erro)
          ]));

        this.createUsuarioForm.get('email').updateValueAndValidity();
        this.desabilitaCampos();
        return;
      }

      this.createUsuarioForm.get('email').setValidators(Validators.compose([Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"), Validators.required]));
      this.createUsuarioForm.get('email').updateValueAndValidity();
      this.habilitaCampos();
    });
  }

  verificaConfirmacaoEmail(confirmacaoEmail: string) {
    this.createUsuarioForm.get('confirmacaoEmail').setValidators(Validators.compose([
      Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"),
      Validators.required,
      Utility.dynamicValidator(() => { return confirmacaoEmail == this.createUsuarioForm.get('email').value; }, "EmailDiferente")
    ]));

    this.createUsuarioForm.get('confirmacaoEmail').updateValueAndValidity();
    this.habilitaCampos();
  }

  desabilitaConfirmar() {
    return !this.createUsuarioForm.valid || !this.emailVerificado
      || this.novoDepartamento(this.createUsuarioForm.get('departamento').value)
      || this.novoCargo(this.createUsuarioForm.get('cargo').value);
  }

  liberarAcesso(event: LiberarAcessos) {
    this.notificacaoService.liberarInformacoes(this.usuarioGuid, LiberarInformacoesTela.UsuarioEmpresa, event.solicitante, event.solicitanteValor).subscribe(response => {
      if (response.errors == null) {
        this.mostraDocumentoUsuario();
      }
    });
  }

  private habilitaCampos() {
    Object.keys(this.createUsuarioForm.controls).forEach((control) => {
      if (control == 'email') return;
      this.createUsuarioForm.get(control).enable()
    });
  }

  private desabilitaCampos() {
    Object.keys(this.createUsuarioForm.controls).forEach((control) => {
      if (control == 'email') return;
      this.createUsuarioForm.get(control).disable()
    });
  }

  private mostrarMensagem(mensagemModal: string, usuarioGuid: string) {
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'usuario-existente'),
      width: '500px',
      height: '',
      data: {
        component: DialogUsuarioExistenteComponent,
        title: '',
        mensagemModal: mensagemModal,
        buttonCancel: {
          value: false,
          text: 'Desistir',
        },
        buttonConfirm: {
          value: true,
          text: 'Confirmar',
        },
        disableSaveWithoutData: true,
      },
      autoFocus: false
    });

    dialogRef.beforeClosed().subscribe((confirmacao: boolean) => {
      if (confirmacao) {
        this.store.dispatch(showPreloader({ payload: '' }));
        this.transferirUsuario(usuarioGuid, this.empresaId);
      }
    });
  }

  private transferirUsuario(usuarioGuid: string, empresaId: number) {
    this.usuariosEmpresaService.transferirUsuario(usuarioGuid, empresaId).subscribe(response => {
      this.store.dispatch(closePreloader());
      if (response.usuarioGuid) {
        this.notifierService.showNotification('Transferência de cadastro de usuário realizada com sucesso!', '', 'success');
        this.goBack();
        return;
      }

      this.notifierService.showNotification(response.errors[0].message, '', 'error');
    });
  }

  private mostraDocumentoUsuario() {
    this.store.dispatch(showPreloader({ payload: '' }));
    this.usuariosEmpresaService.obterUsuarioPorGuid(this.usuarioGuid, this.empresaId, false).subscribe(response => {
      if (response.documento) {
        this.anonimizar = false;
        this.createUsuarioForm.get('cpf').setValue(response.documento);
        this.store.dispatch(closePreloader());
      }
    });
  }

  private verificalPermissoesPerfil(perfilId: number, notificacaoCarregada: boolean = null) {
    this.habilitarNotificacaoFaturamento = false;
    this.createUsuarioForm.get('notificaFaturamento').patchValue(false);

    this.perfilService.obterPerfil(perfilId).subscribe({
      next: (response) => {
        let grupoPermissao = response.grupoPermissaoPerfil.grupoPermissoes.filter(g => g.nomeGrupoPermissao.includes('Financeiro'));

        if (grupoPermissao) {
          this.habilitarNotificacaoFaturamento = grupoPermissao[0].permissoes.filter(p => p.palavraChave.includes('GESTAO_FINANCEIRO_RELATORIOS') && p.ativo).length > 1;
        }

        if (notificacaoCarregada != null && this.habilitarNotificacaoFaturamento) {
          this.createUsuarioForm.get('notificaFaturamento').setValue(notificacaoCarregada);
        }
      }
    })
  }
}
