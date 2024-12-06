import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissoesRotas } from 'src/app/core/common/permissoes-rotas';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { CanActiveGuard } from 'src/app/shared/guards/can-active.guard';
import { DetalhamentoCompraComponent } from './pages/detalhamento-compra/detalhamento-compra.component';
import { FormCompraManualComponent } from './pages/form-compra-manual/form-compra-manual.component';
import { FormParametrizarDudaComponent } from './pages/form-parametrizar-duda/form-parametrizar-duda.component';

const routes: Routes = [
  {
    path: 'parametrizar-duda/:empresaId',
    component: FormParametrizarDudaComponent,
    canActivate: [AuthGuard, CanActiveGuard],
    data: {
      breadcrumb: 'Parametrizar DUDA',
      permission: PermissoesRotas.GESTAO_OPERACOES_DUDAS_PARAMETRIZAR
    }
  },
  {
    path: 'compra-manual/:cnpj/:detranId',
    component: FormCompraManualComponent,
    canActivate: [AuthGuard, CanActiveGuard],
    data: {
      breadcrumb: 'Compra manual',
      permission: PermissoesRotas.GESTAO_OPERACOES_DUDAS_COMPRAR
    }
  },
  {
    path: 'detalhamento/:id',
    component: DetalhamentoCompraComponent,
    canActivate: [AuthGuard, CanActiveGuard],
    data: {
      breadcrumb: 'Detalhamento de compra Duda',
      permission: PermissoesRotas.GESTAO_OPERACOES_DUDAS
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestaoDudasRoutingModule { }
