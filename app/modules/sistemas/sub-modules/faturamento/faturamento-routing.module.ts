import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PermissoesRotas } from "src/app/core/common/permissoes-rotas";
import { CanActiveGuard } from "src/app/shared/guards/can-active.guard";
import { GestaoAprovacoesComponent } from "./pages/gestao-aprovacoes/gestao-aprovacoes.component";
import { RelatoriosComponent } from "./pages/relatorios/relatorios.component";
import { UploadDetranComponent } from "./pages/upload-detran/upload-detran.component";

const routes: Routes = [
  {
    path: 'monitor-faturamento',
    canActivate: [CanActiveGuard],
    data: {
      breadcrumb: 'Financeiro',
      permission: PermissoesRotas.MONITOR_FATURAMENTO
    },
    loadChildren: () => import('./pages/monitor-faturamento/monitor-faturamento.module').then(m => m.MonitorFaturamentoModule)
  },
  {
    path: 'relatorios-faturamento',
    component: RelatoriosComponent,
    canActivate: [CanActiveGuard],
    data: {
      breadcrumb: 'Relatórios',
      permission: PermissoesRotas.GESTAO_FINANCEIRO_RELATORIOS
    },
  },
  {
    path: 'upload-detran',
    component: UploadDetranComponent,
    canActivate: [CanActiveGuard],
    data: {
      breadcrumb: 'Upload de arquivo DETRAN',
      permission: PermissoesRotas.UPLOAD_ARQUIVO_DETRAN
    },
  },
  {
    path: 'gestao-aprovacoes',
    component: GestaoAprovacoesComponent,
    canActivate: [CanActiveGuard],
    data: {
      breadcrumb: 'Gestão de aprovações',
      permission: PermissoesRotas.GESTAO_FINANCEIRO_APROVACOES
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FaturamentoRoutingModule { }