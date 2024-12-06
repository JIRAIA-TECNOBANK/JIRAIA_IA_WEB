import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/core/guards/auth.guard";

import { HomeAdminComponent } from "./pages/home-admin/home-admin.component";
import { CanActiveGuard } from "src/app/shared/guards/can-active.guard";
import { PermissoesRotas } from "src/app/core/common/permissoes-rotas";

const routes: Routes = [
  {
    path: '',
    component: HomeAdminComponent,
    data: {
      breadcrumb: 'ADMIN'
    },
    canActivate: [AuthGuard]
  },
  {
    path: '',
    canActivate: [CanActiveGuard],
    loadChildren: () => import('./pages/acessos/acessos.module').then(m => m.AcessosModule)
  },

]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
