import { Component, OnInit } from '@angular/core';
import { Validators, UntypedFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Utility } from 'src/app/core/common/utility';
import { Usuario } from 'src/app/core/models/usuarios/usuario.model';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { Area } from '../../../../../core/models/areas/areas.model';
import { Perfil } from '../../../../../core/models/perfis/perfil.model';
import { PerfilFiltro } from '../../../../../core/models/perfis/perfilFiltro.model';
import { CriarUsuarioRequest } from '../../../../../core/requests/usuarios/criar-usuario.request';
import { AreasService } from '../../../../../../crm/services/areas.service';
import { PerfisService } from '../../../../../services/perfis.service';
import { UsuariosService } from '../../../../../services/usuarios.service';
import { Permissoes } from 'src/app/core/common/permissoes';

@Component({
  selector: 'app-criar-usuario',
  templateUrl: './criar-usuario.component.html',
  styleUrls: ['./criar-usuario.component.scss']
})
export class CriarUsuarioComponent implements OnInit {

  Permissoes = Permissoes;
  utility = Utility;

  createUsuarioForm = this.formBuilder.group({
    id: null,
    primeiroNome: '',
    sobrenome: '',
    email: ['', Validators.compose([Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"), Utility.isValidEmailTBK()])],
    cpf: '',
    celular: '',
    area: '',
    perfil: '',
    ativo: true
  });

  usuarioId: string = null;
  usuarioGuid: string = null;

  areas: Area[];
  perfis: Perfil[];
  usuarioModel: Usuario = null;

  selectedArea: string = null;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private usuarioService: UsuariosService,
    private areasService: AreasService,
    private notifierService: NotifierService,
    private activatedRoute: ActivatedRoute,
    private store: Store<{ preloader: IPreloaderState }>,
    private perfilService: PerfisService
  ) {
    this.usuarioId = this.activatedRoute.snapshot.params['usuarioId'];
  }

  ngOnInit(): void {
    if (!Utility.getPermission([Permissoes.GESTAO_USUARIO_INTERNO_CADASTRAR])) {
      Utility.modoConsulta(this.createUsuarioForm);
    }
    
    if (this.usuarioId) {
      this.carregarAreas();
      this.carregarPerfis();
      this.carregarDadosUsuario();
      return;
    }

    this.carregarAreas();
    this.carregarPerfis();
  }

  submitUsuario() {
    let usuario = <CriarUsuarioRequest>{
      primeiroNome: this.createUsuarioForm.get('primeiroNome').value,
      sobrenome: this.createUsuarioForm.get('sobrenome').value,
      telefone: this.createUsuarioForm.get('celular').value,
      documento: this.createUsuarioForm.get('cpf').value,
      email: this.createUsuarioForm.get('email').value.toLowerCase(),
      areaId: this.createUsuarioForm.get('area').value,
      perfilId: this.createUsuarioForm.get('perfil').value,
      master: false,
      ativo: this.createUsuarioForm.get('ativo').value
    };

    this.store.dispatch(showPreloader({ payload: '' }))

    if (!this.usuarioId) {
      this.usuarioService.criarUsuario(usuario)
        .subscribe(result => {
          if (result.errors) {
            this.notifierService.showNotification(result.errors[0].message, '', 'error');
            this.store.dispatch(closePreloader())
            return;
          }

          this.atualizaUsuarioSucesso(false);
        },
          error => { this.store.dispatch(closePreloader()) }
        );

      return;
    }

    this.usuarioService.atualizarUsuario(this.usuarioGuid, usuario)
      .subscribe(result => {
        if (result) {
          if (result.errors) {
            this.notifierService.showNotification(result.errors[0].message, result.errors[0].code, 'error');
            this.store.dispatch(closePreloader())
            return;
          }

          if (this.usuarioModel.ativo == usuario.ativo) {
            this.atualizaUsuarioSucesso(true);
            return;
          }

          this.inativarUsuario(this.usuarioGuid, usuario.ativo, true);
        }
      }, error => { this.store.dispatch(closePreloader()) });
  }

  inativarUsuario(usuarioId: string, ativar: boolean, edit: boolean) {
    if (ativar) {
      this.usuarioService.ativarUsuario(usuarioId).subscribe((result) => {
        if (result.usuarioGuid) {
          this.atualizaUsuarioSucesso(edit);
        }
      });
      return;
    }

    this.usuarioService.inativarUsuario(usuarioId).subscribe((result) => {
      if (result.usuarioGuid) {
        this.atualizaUsuarioSucesso(edit);
      }
    });
  }

  atualizaUsuarioSucesso(edit: boolean) {
    if (edit) {
      this.notifierService.showNotification(
        'Usuário atualizado.',
        'Sucesso',
        'success'
      );
      this.store.dispatch(closePreloader())
      this.router.navigate(['../../'], {
        relativeTo: this.activatedRoute,
      });
      return;
    }

    this.notifierService.showNotification(
      'Usuário criado.',
      'Sucesso',
      'success'
    );
    this.store.dispatch(closePreloader())
    this.router.navigate(['../'], {
      relativeTo: this.activatedRoute,
    });
  }

  carregarAreas() {
    this.areasService.obterAreas().subscribe(result => {
      this.areas = result.areas;
    })
  }

  carregarPerfis() {
    let filtro = <PerfilFiltro>{ ativo: [true], };
    this.perfilService.obterPerfisPaginado(0, 100, filtro, 'nome.asc').subscribe(result => {
      this.perfis = result.perfis;
    });
  }

  carregarDadosUsuario() {
    this.usuarioService.obterUsuarioPorId(this.usuarioId).subscribe(result => {
      if (result.id) {
        this.usuarioModel = <Usuario>{
          id: result.usuarioGuid,
          primeiroNome: result.primeiroNome,
          sobrenome: result.sobrenome,
          email: result.email,
          cpf: result.documento,
          celular: result.telefone,
          perfil: result.perfilId,
          area: result.areaId,
          ativo: result.ativo
        };

        this.createUsuarioForm.setValue({
          id: result.usuarioGuid,
          primeiroNome: result.primeiroNome,
          sobrenome: result.sobrenome,
          email: result.email,
          cpf: result.documento,
          celular: result.telefone,
          perfil: result.perfilId,
          area: result.areaId,
          ativo: result.ativo
        });
      }

      this.usuarioGuid = result.usuarioGuid;

      this.createUsuarioForm.get('email').disable();

      this.store.dispatch(closePreloader())
    });

  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(tipoElemento, nomeElemento, guidElemento);
  }
}
