import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { SubmitGrupoEconomicoRequest } from '../../../../core/requests/grupos-economicos/criar-grupo-economico.request';
import { GruposEconomicosService } from '../../../../services/grupos-economicos.service';

import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacyTabGroup as MatTabGroup } from '@angular/material/legacy-tabs';
import { Store } from '@ngrx/store';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { LiberarInformacoesTela } from 'src/app/core/enums/liberar-informacoes-tela.enum';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { LiberarAcessos } from 'src/app/modules/sistemas/core/models/common/liberar-acessos.model';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { GrupoEconomicoUsuarioMaster } from '../../../../core/models/grupos-economicos/grupo-economico-usuario-master.model';
import { ObterUsuarioPorEmailResponse } from '../../../../core/responses/usuarios-empresa/obter-usuario-por-email.response';
import { NotificacaoService } from '../../../../services/notificacao.service';
import { UsuariosEmpresaService } from '../../../../services/usuarios-empresa.service';
import { DialogUsuarioExistenteComponent } from '../../../empresas/components/dialog-usuario-existente/dialog-usuario-existente.component';

@Component({
  selector: 'app-criar-grupo-economico',
  templateUrl: './criar-grupo-economico.component.html',
  styleUrls: ['./criar-grupo-economico.component.scss']
})
export class CriarGrupoEconomicoComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;
  anonimizar: boolean = false;

  createGroupForm = this.formBuilder.group({
    id: [null],
    nameGroup: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
    ativo: false,
    quantidadeEmpresa: [0],
    nomeMaster: [null, Validators.required],
    sobrenomeMaster: [null, Validators.required],
    cpfMaster: [null, Validators.compose([Validators.required, Utility.isValidCpf()])],
    email: ['', Validators.compose([Validators.required, Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")])],
    confirmacaoEmail: ['', Validators.compose([Validators.required, Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")])],
    telefones: this.formBuilder.array([this.addTelefoneGrupo()]),
    enviaNotificacao: [false],
    ativaMfa: [false],
    cpfAnonimizado: [{ value: null, disabled: true }],
    notificaFaturamento: [false]
  })

  @ViewChildren('childTabs') childTabs: QueryList<MatTabGroup>;

  activeIndex: number = 0;

  viewBox: boolean = false;
  previousUrl: string;
  grupoEconomicoId: number = null;
  childstate: boolean = false;
  criacaoGrupo: boolean = true;
  editarGrupo: boolean = false;

  dadosOpen: boolean = true;

  emailVerificado: boolean = false;

  masterEmail: string = null;
  empresasGrupo: number[] = [];
  atualizarGrid: boolean = false;

  usuarioMasterGuid: string = null;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private gruposEconomicosService: GruposEconomicosService,
    private notifierService: NotifierService,
    private store: Store<{ preloader: IPreloaderState }>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private usuariosEmpresaService: UsuariosEmpresaService,
    public dialog: MatDialog,
    private notificacaoService: NotificacaoService
  ) {
    this.grupoEconomicoId = this.activatedRoute.snapshot.params['grupoEconomicoId'];

    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) {
        this.childstate =
          val['url'].split('atualizar-grupo')[1]?.includes('vincular-empresas') ||
          val['url'].split('atualizar-grupo')[1]?.includes('criar-empresa') ||
          val['url'].split('atualizar-grupo')[1]?.includes('atualizar-empresa') ||
          val['url'].split('atualizar-grupo')[1]?.includes('convidar-usuario') ||
          val['url'].split('atualizar-grupo')[1]?.includes('atualizar-usuario-convidado');

        if (!this.childstate) {
          this.atualizarGrid = !this.atualizarGrid;
        }

        this.criacaoGrupo = val['url'].split('grupos-economicos')[1]?.includes('criar-grupo');

        this.editarGrupo = val['url'].split('grupos-economicos')[1]?.includes('atualizar-grupo');

        if (val['url'].split('grupos-economicos')[1]?.includes('atualizar-grupo') && this.grupoEconomicoId != null && !this.childstate) {
          this.carregarGrupo(this.grupoEconomicoId);
        }
      }
    });
  }

  ngOnInit(): void {
    if (this.grupoEconomicoId == null) { this.desabilitaCampos(['nameGroup']); }

    this.createGroupForm.get('nameGroup').statusChanges.subscribe(status => {
      if (status == 'VALID') {
        this.createGroupForm.get('email').enable();
        this.createGroupForm.get('confirmacaoEmail').enable();
      }
    })
  }

  submitGrupoEconomicoEmpresa() {
    let telefones = [];
    this.createGroupForm.get('telefones').value.forEach(tel => {
      telefones.push(tel.telefone)
    });

    let grupo = <SubmitGrupoEconomicoRequest>{
      nome: this.createGroupForm.get('nameGroup').value,
      ativo: true,
      enviaNotificacao: this.createGroupForm.get('enviaNotificacao').value,
      usuario: <GrupoEconomicoUsuarioMaster>{
        primeiroNome: this.createGroupForm.get('nomeMaster').value,
        sobrenome: this.createGroupForm.get('sobrenomeMaster').value,
        documento: this.createGroupForm.get('cpfMaster').value,
        email: this.createGroupForm.get('email').value,
        telefones: telefones,
        ehMaster: true,
        ativaMfa: this.createGroupForm.get('ativaMfa').value,
        notificaFaturamento: this.createGroupForm.get('notificaFaturamento').value
      }
    };

    this.masterEmail = this.createGroupForm.get('email').value;

    if (this.createGroupForm.get('nameGroup').value != null) {
      this.store.dispatch(showPreloader({ payload: '' }))

      if (!this.editarGrupo && !this.createGroupForm.get('id').value) {
        this.incluirGrupo(grupo);
        return;
      }

      this.atualizarGrupo(grupo, telefones);
    }
  }

  ativarInativarGrupo(grupo: SubmitGrupoEconomicoRequest) {
    if (grupo.ativo) {
      this.gruposEconomicosService.ativarGrupoEconomico(this.createGroupForm.get('id').value).subscribe(() => {
        this.store.dispatch(closePreloader());
        this.dadosOpen = false;
      })

      return;
    }

    this.gruposEconomicosService.inativarGrupoEconomico(this.createGroupForm.get('id').value).subscribe(() => {
      this.store.dispatch(closePreloader());
      this.dadosOpen = false;
    })
  }

  goBack() {
    if (this.editarGrupo) {
      this.router.navigate(['../../../grupos-economicos'], { relativeTo: this.activatedRoute });
      return;
    }

    this.router.navigate(['../../grupos-economicos'], { relativeTo: this.activatedRoute });
  }

  goTo(params: string) {
    this.router.navigate([`${params}`], { relativeTo: this.activatedRoute });
  }

  incluirEmpresaExistente() {
    if (this.criacaoGrupo) {
      this.goTo(`../atualizar-grupo/${this.grupoEconomicoId}/criar-empresa`);
      return;
    }

    this.goTo('criar-empresa');
  }

  addEmpresaExistente() {
    if (this.criacaoGrupo) {
      this.goTo(`../atualizar-grupo/${this.grupoEconomicoId}/vincular-empresas`);
      return;
    }

    this.goTo('vincular-empresas');
  }

  carregarGrupo(grupoEconomicoId: number) {
    this.store.dispatch(showPreloader({ payload: '' }))
    this.emailVerificado = true;
    this.anonimizar = true;
    this.obterEmpresasDoGrupo();

    this.gruposEconomicosService.obterGrupoEconomico(grupoEconomicoId).subscribe(response => {
      this.store.dispatch(closePreloader())
      if (response.errors) {
        this.notifierService.showNotification(response.errors[0].message, response.errors[0].code, 'error');
        return;
      }

      this.createGroupForm = this.formBuilder.group({
        id: response.id,
        nameGroup: response.nome,
        ativo: response.ativo,
        quantidadeEmpresa: response.quantidadeEmpresa,
        nomeMaster: response.usuarioMaster.primeiroNome,
        sobrenomeMaster: response.usuarioMaster.sobrenome,
        cpfMaster: response.usuarioMaster.documento,
        cpfAnonimizado: { value: response.usuarioMaster.documento, disabled: true },
        email: response.usuarioMaster.email,
        confirmacaoEmail: response.usuarioMaster.email,
        telefones: this.formBuilder.array([this.addTelefoneGrupo(response.usuarioMaster.telefones[0])]),
        enviaNotificacao: response.enviaNotificacao,
        ativaMfa: response.usuarioMaster.ativaMfa,
        notificaFaturamento: response.usuarioMaster.notificaFaturamento
      });

      this.usuarioMasterGuid = response.usuarioMaster.usuarioGuid;

      this.createGroupForm.controls['telefones'] = this.formBuilder.array([this.addTelefoneGrupo(response.usuarioMaster.telefones[0])]);

      this.masterEmail = response.usuarioMaster.email;

      if (!Utility.getPermission([Permissoes.GESTAO_EMPRESA_GRUPO_ECONOMICO_CADASTRAR])) {
        Utility.modoConsulta(this.createGroupForm);
      }

      if (response.usuarioMaster.telefones.length > 1) {
        for (let i = 1; i < response.usuarioMaster.telefones.length; i++) {
          this.addTelefone(response.usuarioMaster.telefones[i]);
        }
      }

      if (response.quantidadeEmpresa == 0) {
        this.viewBox = true;
      }

      this.verificaConfirmacaoEmail(this.createGroupForm.get("confirmacaoEmail").value);
    })
  }

  private incluirGrupo(grupo: SubmitGrupoEconomicoRequest) {
    this.gruposEconomicosService.criarGrupoEconomico(grupo).subscribe(response => {
      if (response.grupoEconomicoId) {
        this.viewBox = true;
        this.grupoEconomicoId = response.grupoEconomicoId;
        this.createGroupForm.get('id').setValue(this.grupoEconomicoId);
        this.notifierService.showNotification('Grupo criado.', 'Sucesso', 'success');
        this.dadosOpen = false;
        this.store.dispatch(closePreloader())
        return
      }
      else {
        this.createGroupForm.get('nameGroup').setValue('')
        this.createGroupForm.get('ativo').setValue(false)
        this.notifierService.showNotification(response.errors[0].message, 'Error', 'error')
      }
      this.store.dispatch(closePreloader())
    }, error => {
      this.store.dispatch(closePreloader())
      this.notifierService.showNotification(`${error}`, 'Error', 'error')
    })
  }

  private atualizarGrupo(grupo: SubmitGrupoEconomicoRequest, telefones) {
    this.gruposEconomicosService.atualizarGrupoEconomico(this.grupoEconomicoId, grupo).subscribe(response => {
      if (response.grupoEconomicoId) {
        this.viewBox = true;
        this.grupoEconomicoId = response.grupoEconomicoId;

        for (let i = 0; i < telefones.length; i++) {
          this.removeTelefone(i);
        }

        this.createGroupForm.reset();

        this.createGroupForm = this.formBuilder.group({
          id: response.grupoEconomicoId,
          nameGroup: response.nome,
          ativo: response.ativo,
          quantidadeEmpresa: null,
          nomeMaster: response.usuario.primeiroNome,
          sobrenomeMaster: response.usuario.sobrenome,
          cpfMaster: response.usuario.documento,
          email: response.usuario.email,
          confirmacaoEmail: response.usuario.email,
          telefones: this.formBuilder.array([this.addTelefoneGrupo(response.usuario.telefones[0])]),
          enviaNotificacao: response.enviaNotificacao,
          cpfAnonimizado: [{ value: response.usuario.documento, disabled: true }],
          ativaMfa: grupo.usuario.ativaMfa,
          notificaFaturamento: grupo.usuario.notificaFaturamento
        });

        if (response.usuario.telefones.length > 1) {
          for (let i = 1; i < response.usuario.telefones.length; i++) {
            this.addTelefone(response.usuario.telefones[i]);
          }
        }

        this.verificaConfirmacaoEmail(this.createGroupForm.get("confirmacaoEmail").value);

        this.notifierService.showNotification('Grupo alterado.', 'Sucesso', 'success');
        this.dadosOpen = false;
        this.store.dispatch(closePreloader());
        return
      }
      else {
        this.createGroupForm.get('nameGroup').clearValidators()
        this.createGroupForm.get('nameGroup').setValue('')
        this.createGroupForm.get('nameGroup').updateValueAndValidity()
        this.createGroupForm.get('ativo').clearValidators()
        this.createGroupForm.get('ativo').setValue(false)
        this.createGroupForm.get('ativo').updateValueAndValidity()
        this.notifierService.showNotification(response.errors[0].message, 'Error', 'error')
      }
      this.store.dispatch(closePreloader())
    }, error => {
      this.store.dispatch(closePreloader())
      this.notifierService.showNotification(`${error}`, 'Error', 'error')
    })
  }

  private obterEmpresasDoGrupo() {
    let filtro = {
      pageIndex: 0,
      pageSize: 200,
      disponiveis: false
    };
    this.empresasGrupo = [];

    this.gruposEconomicosService.obterEmpresas(this.grupoEconomicoId, filtro).subscribe(response => {
      this.empresasGrupo.push(...response.empresas.map(empresa => empresa.id));
    });
  }

  private addTelefoneGrupo(value: string = ''): FormGroup {
    return this.formBuilder.group({
      telefone: [value, Validators.required]
    });
  }

  addTelefone(value: string = null): void {
    if (this.telefonesArray.length < 5) {
      this.telefonesArray.push(this.addTelefoneGrupo(value));
    }
  }

  removeTelefone(index: number): void {
    this.telefonesArray.removeAt(index);
  }

  get telefonesArray(): FormArray {
    return <FormArray>this.createGroupForm.get('telefones');
  }

  onTabChange(event: any) {
    this.activeIndex = event.index;

    this.childTabs.forEach(childTab => {
      childTab.realignInkBar();
    });
  }

  verificaEmail(email) {
    this.emailVerificado = false;

    if (this.masterEmail == email) {
      this.emailVerificado = true;
      return;
    }

    this.usuariosEmpresaService.obterUsuarioPorEmail(email).subscribe(response => {
      this.emailVerificado = true;

      if (response.id) {
        if (response.empresa == null || !this.empresasGrupo.includes(response.empresa.id)) {
          let erro = 'usuarioExistente';

          this.mostrarMensagem(response);

          this.createGroupForm.get('email').setValidators(
            Validators.compose([
              Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"),
              Validators.required,
              Utility.dynamicValidator(() => { return response.id == undefined; }, erro)
            ]));

          this.createGroupForm.get('email').updateValueAndValidity();
          this.desabilitaCampos(['nameGroup', 'email']);
        }

        return;
      }

      this.createGroupForm.get('email').setValidators(Validators.compose([Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"), Validators.required]));
      this.createGroupForm.get('email').updateValueAndValidity();
      this.habilitaCampos();
    });
  }

  verificaConfirmacaoEmail(confirmacaoEmail: string) {
    this.createGroupForm.get('confirmacaoEmail').setValidators(Validators.compose([
        Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"),
        Validators.required,
        Utility.dynamicValidator(() => { return confirmacaoEmail == this.createGroupForm.get('email').value; }, "EmailDiferente")
      ]));

    this.createGroupForm.get('confirmacaoEmail').updateValueAndValidity();
    this.habilitaCampos();
  }

  desabilitaConfirmar() {
    return !this.createGroupForm.valid || !this.emailVerificado;
  }

  public getElementId(tipoElemento: TipoElemento, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(tipoElemento, nomeElemento, guidElemento);
  }

  liberarAcesso(event: LiberarAcessos) {
    this.notificacaoService.liberarInformacoes(this.usuarioMasterGuid, LiberarInformacoesTela.UsuarioMaster, event.solicitante, event.solicitanteValor).subscribe(response => {
      if (response.errors == null) {
        this.mostraDocumentoUsuario();
      }
    });
  }

  private desabilitaCampos(exceto: string[]) {
    Object.keys(this.createGroupForm.controls).forEach((control) => {
      if (exceto.includes(control)) return;
      this.createGroupForm.get(control).disable()
    });
  }

  private habilitaCampos() {
    Object.keys(this.createGroupForm.controls).forEach((control) => {
      if (control == 'cpfAnonimizado') return;
      this.createGroupForm.get(control).enable()
    });
  }

  private mostrarMensagem(response: ObterUsuarioPorEmailResponse) {
    let mensagem = response.mensagemModal ?? `<p>O e-mail informado já se encontra cadastrado em outro grupo econômico.</p> <p>Para prosseguir com a transferência dos dados para esse novo cadastro clique em CONFIRMAR ou DESISTIR para sair.</p>`

    const dialogRef = this.dialog.open(DialogCustomComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'usuario-existente'),
      width: '500px',
      height: '',
      data: {
        component: DialogUsuarioExistenteComponent,
        title: '',
        mensagemModal: mensagem,
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

        this.createGroupForm.get('nomeMaster').patchValue(response.primeiroNome);
        this.createGroupForm.get('sobrenomeMaster').patchValue(response.sobrenome);
        this.createGroupForm.get('cpfMaster').patchValue(response.documento);
        this.createGroupForm.get('email').setValidators(Validators.compose([Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"), Validators.required]));
        this.createGroupForm.get('email').updateValueAndValidity();

        if (response.telefone) { this.createGroupForm.controls['telefones']['controls'][0].controls.telefone.patchValue(response.telefone); }
        else if (response.telefones.length > 1) {
          for (let i = 1; i < response.telefones.length; i++) {
            this.addTelefone(response.telefones[i]);
          }
        }
        else if (response.telefones.length == 1) {
          this.createGroupForm.controls['telefones']['controls'][0].controls.telefone.patchValue(response.telefones[0]);
        }

        this.submitGrupoEconomicoEmpresa();
      }
    });
  }

  private mostraDocumentoUsuario() {
    this.store.dispatch(showPreloader({ payload: '' }));
    this.gruposEconomicosService.obterGrupoEconomico(this.grupoEconomicoId, false).subscribe(response => {
      if (response?.usuarioMaster) {
        this.createGroupForm.get('cpfMaster').setValue(response.usuarioMaster?.documento);
        this.anonimizar = false;
        this.store.dispatch(closePreloader());
      }
    });
  }
}
