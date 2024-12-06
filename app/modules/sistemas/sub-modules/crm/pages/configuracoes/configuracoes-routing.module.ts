import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'e-contrato',
    data: {
      breadcrumb: 'e-Contrato'
    },
    loadChildren: () => import('./e-contrato/e-contrato.module').then(m => m.EContratoModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfiguracoesRoutingModule { }
