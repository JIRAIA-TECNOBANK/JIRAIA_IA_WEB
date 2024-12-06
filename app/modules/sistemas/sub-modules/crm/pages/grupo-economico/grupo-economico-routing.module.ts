import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PermissoesRotas } from "src/app/core/common/permissoes-rotas";
import { AuthGuard } from "src/app/core/guards/auth.guard";
import { CanActiveGuard } from "src/app/shared/guards/can-active.guard";
import { UsuariosConvidadosComponent } from "./components/convidados/usuarios-convidados/usuarios-convidados.component";
import { CriarGrupoEconomicoComponent } from "./components/criar-grupo-economico/criar-grupo-economico.component";

const routes: Routes = [
  {
    path: '',
    redirectTo: '/organizacoes',
    pathMatch: 'full'
  },
  {
    path: 'criar-grupo',
    component: CriarGrupoEconomicoComponent,
    data: {
      breadcrumb: 'Novo grupo',
      permission: PermissoesRotas.GESTAO_EMPRESAS_GRUPOS_CADASTRAR
    },
    canActivate: [AuthGuard, CanActiveGuard]
  },
  {
    path: 'atualizar-grupo/:grupoEconomicoId',
    component: CriarGrupoEconomicoComponent,
    canActivate: [AuthGuard, CanActiveGuard],
    data: {
      breadcrumb: 'Editar grupo',
      permission: PermissoesRotas.GESTAO_EMPRESAS_GRUPOS
    },
    children: [
      {
        path: 'convidar-usuario',
        component: UsuariosConvidadosComponent,
        data: {
          breadcrumb: 'Convidar usuário',
          permission: PermissoesRotas.GESTAO_EMPRESAS_GRUPOS_CONVIDADO_CADASTRAR
        },
        canActivate: [AuthGuard, CanActiveGuard]
      },
      {
        path: 'atualizar-usuario-convidado/:id',
        component: UsuariosConvidadosComponent,
        data: {
          breadcrumb: 'Alterar usuário convidado',
          permission: PermissoesRotas.GESTAO_EMPRESAS_GRUPOS_CONVIDADO_CADASTRAR
        },
        canActivate: [AuthGuard, CanActiveGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GrupoEconomicoRoutingModule { }
