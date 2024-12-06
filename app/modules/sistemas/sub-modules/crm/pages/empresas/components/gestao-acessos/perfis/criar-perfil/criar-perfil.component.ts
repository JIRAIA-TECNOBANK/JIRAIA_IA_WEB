import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Utility } from 'src/app/core/common/utility';
import { GrupoPermissoes } from 'src/app/modules/sistemas/sub-modules/crm/core/models/grupo-permissoes/grupo-permissoes.model';
import { Grupo } from 'src/app/modules/sistemas/sub-modules/crm/core/models/grupo-permissoes/grupo.model';
import { Permissoes } from 'src/app/modules/sistemas/sub-modules/crm/core/models/grupo-permissoes/permissoes.model';
import { CriarPerfilRequest } from 'src/app/modules/sistemas/sub-modules/crm/core/requests/perfis/criar-perfil.request';
import { GrupoPermissoesService } from 'src/app/modules/sistemas/sub-modules/crm/services/grupo-permissoes.service';
import { PerfisService } from 'src/app/modules/sistemas/sub-modules/crm/services/perfis.service';
import { DialogSimpleService } from 'src/app/shared/components/dialog-simple/dialog-simple.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import {
  closePreloader,
  showPreloader,
} from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';

@Component({
  selector: 'app-criar-perfil',
  templateUrl: './criar-perfil.component.html',
  styleUrls: ['./criar-perfil.component.scss'],
})
export class CriarPerfilComponent implements OnInit {
  constructor(
    private formBuilder: UntypedFormBuilder,
    private grupoPermissaoService: GrupoPermissoesService,
    private perfilService: PerfisService,
    private activatedRoute: ActivatedRoute,
    private notifierService: NotifierService,
    private store: Store<{ preloader: IPreloaderState }>,
    private router: Router,
    public dialog: DialogSimpleService
  ) {
    this.perfilId = this.activatedRoute.snapshot.params['perfilId'];
    this.empresaId = this.activatedRoute.snapshot.parent.params['empresaId'];
  }

  perfilId: number = null;
  empresaId: number;
  errorName: string = null;

  gruposList: Grupo[] = [];

  createPerfilForm = this.formBuilder.group({
    nome: ['', Validators.compose([Utility.isValidName()])],
    descricao: '',
    ativo: true,
    convidado: false,
  });

  permissoesPerfis: Permissoes;

  perfilConvidado: boolean = false;
  init: boolean = false;

  ngOnInit(): void {
    this.createPerfilForm.get('convidado').valueChanges.subscribe((value) => {
      if (!value) {
        if (this.perfilId && this.init) {
          const dialogRef = this.dialog.showDialog(
            `
          Ao desabilitar a opção “perfil para usuários convidados”, qualquer usuário convidado que esteja atrelado a este perfil terá seu acesso removido. 
          Tem certeza de que deseja prosseguir?`,
            'Prosseguir',
            'Atenção'
          );

          dialogRef.afterClosed().subscribe((confirmacao) => {
            if (!confirmacao) {
              this.createPerfilForm.get('convidado').patchValue(true);
              return;
            }
          });
          this.perfilConvidado = value;
          this.carregaGruposPermissoes();
        }
      }
    });

    if (!this.perfilId) {
      this.carregaGruposPermissoes();
      return;
    }

    this.carregaPerfil(this.perfilId);
  }

  switchGuestUser() {
    if (this.createPerfilForm.get('convidado').value) {
      const dialogRef = this.dialog.showDialog(
        `
          Ao desabilitar a opção “perfil para usuários convidados”, qualquer usuário convidado que esteja atrelado a este perfil terá seu acesso removido. 
          Tem certeza de que deseja prosseguir?`,
        'Prosseguir',
        'Atenção'
      );

      dialogRef.afterClosed().subscribe((confirmacao) => {
        if (!confirmacao) {
          this.createPerfilForm.get('convidado').patchValue(true);
          return;
        } else this.perfilId ? this.carregaPerfilPermissoes(this.perfilId) : this.carregaGruposPermissoes();;
      });
    } else {
      this.gruposList = this.gruposList.filter(
        (grupo) => grupo.nomeGrupoPermissao !== 'Gestão de Acessos'
      );
    }
  }

  carregaGruposPermissoes() {
    this.grupoPermissaoService.obterGruposPermissoes().subscribe((response) => {
      let gruposPermissoes = [];

      if (this.perfilConvidado) {
        gruposPermissoes = response.grupoPermissoes.filter(
          (grupo) => grupo.nomeGrupoPermissao !== 'Gestão de Acessos'
        );
      } else {
        gruposPermissoes = response.grupoPermissoes;
      }

      this.gruposList = gruposPermissoes;
    });
  }

  carregaPerfil(perfilId: number) {
    this.perfilService.obterPerfil(perfilId).subscribe((response) => {
      this.createPerfilForm.setValue({
        nome: response.nome,
        descricao: response.descricao,
        ativo: response.ativo,
        convidado: response.convidado,
      });
      if (response.convidado) {
        this.gruposList = response.grupoPermissaoPerfil.grupoPermissoes.filter(
          (grupo) => grupo.nomeGrupoPermissao !== 'Gestão de Acessos'
        );
      } else {
        this.gruposList = response.grupoPermissaoPerfil.grupoPermissoes;
      }
    });
  }

  carregaPerfilPermissoes(perfilId: number) {
    this.perfilService.obterPerfil(perfilId).subscribe((response) => {
      this.gruposList = response.grupoPermissaoPerfil.grupoPermissoes;
    });
  }

  onSubmit() {
    if (this.createPerfilForm.invalid) return;

    let criarPerfilRequest: CriarPerfilRequest = <CriarPerfilRequest>{
      empresaId: this.empresaId,
      convidado: this.createPerfilForm.get('convidado').value,
      nome: this.createPerfilForm.get('nome').value,
      descricao: this.createPerfilForm.get('descricao').value,
      ativo: this.createPerfilForm.get('ativo').value,
      grupoPermissaoPerfil: <GrupoPermissoes>{
        grupoPermissoes: this.gruposList,
      },
    };

    this.store.dispatch(showPreloader({ payload: '' }));

    if (!this.perfilId) {
      this.perfilService
        .criarPerfil(criarPerfilRequest)
        .subscribe((response) => {
          if (response.perfilId) {
            this.notifierService.showNotification(
              'Perfil cadastrado com sucesso!',
              '',
              'success'
            );
            this.router.navigate(['../'], { relativeTo: this.activatedRoute });
            this.store.dispatch(closePreloader());
            return;
          }

          let message = this.getErrorMessage(response);
          this.notifierService.showNotification(message, '', 'error');
          this.store.dispatch(closePreloader());
        });

      return;
    }

    this.perfilService
      .atualizarPerfil(this.perfilId, criarPerfilRequest)
      .subscribe((response) => {
        if (response.perfilId) {
          this.notifierService.showNotification(
            'Perfil atualizado com sucesso!',
            '',
            'success'
          );
          this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
          this.store.dispatch(closePreloader());
          return;
        }

        let message = this.getErrorMessage(response);
        this.notifierService.showNotification(message, '', 'error');
        this.store.dispatch(closePreloader());
      });
  }

  getErrorMessage(response: any) {
    let message = response.errors[0].message;
    if (response.errors[0].propertyName == 'Nome') {
      message = 'Nome de perfil já cadastrado no sistema.';
      this.errorName =
        'O perfil não poderá receber este nome, tente novamente.';
      this.createPerfilForm.get('nome').setErrors({ incorrect: true });
    }
    return message;
  }

  checkAriaExpanded(tab: any) {
    return tab.panel._expanded;
  }

  selecionaTodosGrupo(checked: boolean, grupo: Grupo) {
    grupo.permissoes.forEach((p) => {
      p.ativo = checked;
    });
  }

  algumSelecionadoGrupo(grupo: Grupo) {
    var retorno = false;

    for (let i = 0; i < grupo.permissoes.length; i++) {
      if (grupo.permissoes[i].ativo) {
        retorno = true;
      }
    }

    if (retorno && this.todosChecados(grupo)) {
      return false;
    }
    return retorno;
  }

  todosChecados(grupo: Grupo) {
    var retorno = true;

    for (let i = 0; i < grupo.permissoes.length; i++) {
      if (!grupo.permissoes[i].ativo) {
        retorno = false;
      }
    }

    return retorno;
  }

  onCheckPermissao(permissao: Permissoes) {
    permissao.ativo = !permissao.ativo;
  }

  retornoPermissaoInfo(permissao: Permissoes): string {
    if (permissao.palavraChave.endsWith('_REGISTRAR_CONTRATO')) {
      return 'Permite: registrar contrato, alterar contrato, incluir aditivo e alterar aditivo.';
    }
    if (permissao.palavraChave.endsWith('_CONSULTAR_CONTRATO')) {
      return 'Permite consultar: registros de contrato, alteração de contrato, inclusão de aditivo e alteração de aditivo.';
    }
    if (permissao.palavraChave.endsWith('_BAIXAR_CANCELAR_CONTRATO')) {
      return 'Essa funcionalidade é exclusiva para o Detran Bahia.';
    }

    return null;
  }

  retornoGrupoInfo(grupo: Grupo) {
    if (grupo.nomeGrupoPermissao.toUpperCase().includes('RELATÓRIO') && !grupo.nomeGrupoPermissao.toUpperCase().includes('FINANCEIRO')) {
      return 'A permissão de consulta de relatório está condicionada a permissão de consulta de registro de contrato.';
    }
    return null;
  }

  public getElementId(
    tipoElemento: number,
    nomeElemento: string,
    guidElemento: any = null
  ): string {
    return Utility.getElementId(tipoElemento, nomeElemento, guidElemento);
  }
}
