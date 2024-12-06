import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AcessoNegadoComponent } from './modules/sistemas/pages/acesso-negado/acesso-negado.component';

const routes: Routes = [
  {
    path: 'configuracoes',
    loadChildren: () => import('./modules/configuracoes/configuracoes.module').then(m => m.ConfiguracoesModule)
  },
  {
    path: '',
    loadChildren: () => import('./modules/sistemas/sistemas.module').then(m => m.SistemasModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'acesso-negado',
    data: {
      breadcrumb: 'Acesso Negado'
    },
    component: AcessoNegadoComponent,
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
