import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { PermissoesSistema } from 'src/app/core/common/permissoes-sistema';
import { Permissao } from 'src/app/modules/sistemas/sub-modules/admin/core/models/perfis/permissao.model';

@Injectable({
  providedIn: 'root',
})
export class CanActiveGuard {
  constructor(private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {

    return this.verificarPermissaoUsuario(route);
  }

  private verificarPermissaoUsuario(route: ActivatedRouteSnapshot): Promise<boolean> {
    return new Promise(resolve => {
      let timer = setInterval(() => {
        let permissoes = PermissoesSistema?.retornarPermissoesSistema;

        if (permissoes.length > 0) {
          let possuiPermissao = this.verificarPermissaoRota(route, permissoes);
          clearInterval(timer);

          resolve(possuiPermissao);
          return possuiPermissao;
        }
      }, 100);
    });
  }

  private verificarPermissaoRota(route: ActivatedRouteSnapshot, permissionList: Permissao[]) {
    let permission = route.data.permission;
    let access: boolean = false;

    for (let i = 0; i < permission.length; i++) {
      if (permissionList.filter(p => p.palavraChave.startsWith(permission[i])).length > 0) access = true;
    }
    if (access) return true;

    this.router.navigate(['/acesso-negado']);
    return false;
  }
}
