import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppSettings } from './configs/app-settings.config';
import { AuthService } from './core/auth/auth.service';
import { PermissoesSistema } from './core/common/permissoes-sistema';
import { Usuario } from './core/models/usuarios/usuario.model';
import { GrupoPermissaoService } from './modules/sistemas/sub-modules/admin/services/grupo-permissao.service';
import { closePreloader, showPreloader } from './shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from './shared/store/preloader/preloader.reducer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private appSettings: AppSettings,
    private grupoPermissaoService: GrupoPermissaoService,
    private authService: AuthService,
    private store: Store<{ preloader: IPreloaderState }>,
    private router: Router) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) {
        this.accessDenied = val['url'].includes('acesso-negado');
      }
    });

    this.authService.obterUsuarioAtual()
      .then((usuario: Usuario) => {
        if (usuario.nome.nomeCompleto) {
          PermissoesSistema.setarNomeUsuario(usuario.nome.nomeCompleto);
        }
      })
  }

  accessDenied: boolean = null;

  ngOnInit() {
    this.store.dispatch(showPreloader({ payload: '' }))

    this.verificaPermissao();
  }

  verificaPermissao() {
    this.grupoPermissaoService.obterPermisssoesUsuario().subscribe(response => {
      if (response?.permissoes?.length > 0) {
        PermissoesSistema.setarPermissoesSistema(response.permissoes);
        this.store.dispatch(closePreloader());
        return;
      }

      this.denyAccess();
    });
  }

  denyAccess() {
    this.store.dispatch(closePreloader());
    this.accessDenied = true;
    this.authService.logout(true);
  }
}
