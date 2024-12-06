import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TrocarSenhaComponent } from './pages/trocar-senha/trocar-senha.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    data: {
      breadcrumb: 'Página inicial'
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./sub-modules/admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: 'crm',
    loadChildren: () =>
      import('./sub-modules/crm/crm.module').then((m) => m.CrmModule),
  },
  {
    path: 'financeiro',
    loadChildren: () =>
      import('./sub-modules/faturamento/faturamento.module').then((m) => m.FaturamentoModule),
  },
  {
    path: 'trocar-senha',
    component: TrocarSenhaComponent,
    data: {
      breadcrumb: 'Trocar senha',
    },
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SistemasRoutingModule { }
