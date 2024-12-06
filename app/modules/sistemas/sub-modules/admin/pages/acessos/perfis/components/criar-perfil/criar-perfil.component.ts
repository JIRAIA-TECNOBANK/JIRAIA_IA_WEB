import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { GrupoPermissoes } from '../../../../../core/models/perfis/grupo-permissoes.model';
import { Grupo } from '../../../../../core/models/perfis/grupo.model';
import { Permissao } from '../../../../../core/models/perfis/permissao.model';
import { CriarPerfilRequest } from '../../../../../core/requests/perfis/criar-perfil.request';
import { GrupoPermissaoService } from '../../../../../services/grupo-permissao.service';
import { PerfisService } from '../../../../../services/perfis.service';
import { Permissoes } from 'src/app/core/common/permissoes';

@Component({
  selector: 'app-criar-perfil',
  templateUrl: './criar-perfil.component.html',
  styleUrls: ['./criar-perfil.component.scss']
})
export class CriarPerfilComponent implements OnInit {

  Permissoes = Permissoes;
  utility = Utility;

  constructor(private formBuilder: UntypedFormBuilder,
    private grupoPermissaoService: GrupoPermissaoService,
    private perfilService: PerfisService,
    private activatedRoute: ActivatedRoute,
    private notifierService: NotifierService,
    private store: Store<{ preloader: IPreloaderState }>,
    private router: Router) {
    this.perfilId = this.activatedRoute.snapshot.params['perfilId'];
  }

  perfilId: number = null;
  errorName: string = null;

  gruposList: Grupo[] = [];

  createPerfilForm = this.formBuilder.group({
    nome: ['', Validators.compose([Utility.isValidName()])],
    descricao: '',
    ativo: true
  });

  ngOnInit(): void {
    if (!Utility.getPermission([Permissoes.GESTAO_USUARIO_INTERNO_CADASTRAR])) {
      Utility.modoConsulta(this.createPerfilForm);
    }

    if (!this.perfilId) {
      this.carregaGruposPermissoes();
      return;
    }

    this.carregaPerfil(this.perfilId);
  }

  carregaGruposPermissoes() {
    this.grupoPermissaoService.obterGruposPermissoes().subscribe(response => {
      this.gruposList = response.grupoPermissoes;
    });
  }

  carregaPerfil(perfilId: number) {
    this.perfilService.obterPerfil(perfilId).subscribe(response => {
      this.createPerfilForm.setValue({
        nome: response.nome,
        descricao: response.descricao,
        ativo: response.ativo
      });

      this.gruposList = response.grupoPermissaoPerfil.grupoPermissoes;
    });
  }

  onSubmit() {
    if (this.createPerfilForm.invalid) return;

    let criarPerfilRequest: CriarPerfilRequest = <CriarPerfilRequest>{
      nome: this.createPerfilForm.get('nome').value,
      descricao: this.createPerfilForm.get('descricao').value,
      ativo: this.createPerfilForm.get('ativo').value,
      grupoPermissaoPerfil: <GrupoPermissoes>{
        grupoPermissoes: this.gruposList
      }
    };

    this.store.dispatch(showPreloader({ payload: '' }));

    if (!this.perfilId) {
      this.perfilService.criarPerfil(criarPerfilRequest).subscribe(response => {
        if (response.perfilId) {
          this.notifierService.showNotification('Perfil cadastrado com sucesso!', '', 'success');
          this.router.navigate(['../../perfis'], { relativeTo: this.activatedRoute });
          this.store.dispatch(closePreloader());
          return;
        }

        let message = this.getErrorMessage(response);
        this.notifierService.showNotification(message, '', 'error');
        this.store.dispatch(closePreloader());
      });

      return;
    }

    this.perfilService.atualizarPerfil(this.perfilId, criarPerfilRequest).subscribe(response => {
      if (response.perfilId) {
        this.notifierService.showNotification('Perfil atualizado com sucesso!', '', 'success');
        this.router.navigate(['../../../perfis'], { relativeTo: this.activatedRoute });
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
      this.errorName = 'O perfil não poderá receber este nome, tente novamente.';
      this.createPerfilForm.get('nome').setErrors({ 'incorrect': true });
    }
    return message;
  }

  checkAriaExpanded(tab: any) {
    return tab.panel._expanded;
  }

  selecionaTodosGrupo(checked: boolean, grupo: Grupo) {
    grupo.permissoes.forEach(p => {
      p.ativo = checked;
    });
  }

  algumSelecionadoGrupo(grupo: Grupo) {
    let retorno = false;

    for (let i = 0; i < grupo.permissoes.length; i++) {
      if (grupo.permissoes[i].ativo) {
        retorno = true;
      }
    }

    if (retorno && this.todosChecados(grupo)) { return false; }
    return retorno;
  }

  todosChecados(grupo: Grupo) {
    let retorno = true;

    for (let i = 0; i < grupo.permissoes.length; i++) {
      if (!grupo.permissoes[i].ativo) {
        retorno = false;
      }
    }

    return retorno;
  }

  onCheckPermissao(permissao: Permissao) {
    permissao.ativo = !permissao.ativo;
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(tipoElemento, nomeElemento, guidElemento);
  }
}
