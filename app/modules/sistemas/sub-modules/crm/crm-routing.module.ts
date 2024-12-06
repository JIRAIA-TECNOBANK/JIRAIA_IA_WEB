import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissoesRotas } from 'src/app/core/common/permissoes-rotas';
import { RotasAuxiliares } from 'src/app/core/common/rotas-auxiliares';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { CanActiveGuard } from 'src/app/shared/guards/can-active.guard';
import { ConexaoDetransComponent } from './pages/conexao-detrans/conexao-detrans.component';
import { ListarEmpresasComponent } from './pages/empresas/pages/listar-empresas/listar-empresas.component';
import { GestaoDudasComponent } from './pages/gestao-dudas/pages/gestao-dudas/gestao-dudas.component';
import { HomeCrmComponent } from './pages/home-crm/home-crm.component';
import { CentralAjudaComponent } from './pages/operacional/central-ajuda/central-ajuda.component';
import { CriarArtigoComponent } from './pages/operacional/central-ajuda/components/criar-artigo/criar-artigo.component';
import { CriarSecaoComponent } from './pages/operacional/central-ajuda/components/criar-secao/criar-secao.component';
import { ConfirmarRegistrosComponent } from './pages/operacional/confirmar-registros/confirmar-registros.component';
import { EditarManualmenteComponent } from './pages/operacional/editar-manualmente/editar-manualmente.component';
import { EspelhoContratoComponent } from './pages/operacional/espelho-contrato/espelho-contrato.component';
import { ConsultarOperacoesComponent } from './pages/operacional/monitor-operacoes/consultar-operacoes/consultar-operacoes.component';
import { CriarNotificacaoComponent } from './pages/operacional/notificacoes/components/criar-notificacao/criar-notificacao.component';
import { NotificacoesComponent } from './pages/operacional/notificacoes/notificacoes.component';
import { UsuariosConectadosComponent } from './pages/operacional/usuarios-conectados/usuarios-conectados.component';
import { VisualizarInconsistenciasComponent } from './pages/operacional/visualizar-inconsistencias/visualizar-inconsistencias.component';

const routes: Routes = [
  {
    path: '',
    component: HomeCrmComponent,
    data: {
      breadcrumb: 'CRM',
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'organizacoes',
    component: ListarEmpresasComponent,
    canActivate: [CanActiveGuard],
    data: {
      breadcrumb: 'Empresas e grupos',
      permission: PermissoesRotas.GESTAO_EMPRESAS_GRUPOS
    },
    children: [{
      path: RotasAuxiliares.EMPRESAS,
      data: {
        breadcrumb: { skip: true }
      },
      loadChildren: () =>
        import('./pages/empresas/empresas.module').then((m) => m.EmpresasModule),
    },
    {
      path: RotasAuxiliares.GRUPOS_ECONOMICOS,
      data: {
        breadcrumb: { skip: true }
      },
      loadChildren: () =>
        import('./pages/grupo-economico/grupo-economico.module').then((m) => m.GrupoEconomicoModule),
    }]
  },
  {
    path: 'relatorios',
    canActivate: [AuthGuard],
    data: {
      breadcrumb: 'Relatorios',
    },
    loadChildren: () =>
      import('./pages/relatorios/relatorios.module').then((m) => m.RelatoriosModule),
  },
  {
    path: 'monitor-operacoes-lotes',
    component: ConsultarOperacoesComponent,
    data: {
      breadcrumb: 'Monitor de operações e lotes',
      permission: PermissoesRotas.MONITOR_OPERACOES_LOTES
    },
    canActivate: [AuthGuard, CanActiveGuard],
    children: [
      {
        path: 'espelho-contrato',
        component: EspelhoContratoComponent,
        data: {
          breadcrumb: 'Espelho de contrato',
          permission: PermissoesRotas.MONITOR_OPERACOES_LOTES
        },
        canActivate: [AuthGuard, CanActiveGuard]
      },
      {
        path: 'visualizar-inconsistencias',
        component: VisualizarInconsistenciasComponent,
        data: {
          breadcrumb: 'Visualizar Inconsistências',
          permission: PermissoesRotas.MONITOR_OPERACOES_LOTES
        },
        canActivate: [AuthGuard, CanActiveGuard],
      },
      {
        path: 'editar-manualmente',
        component: EditarManualmenteComponent,
        data: {
          breadcrumb: 'Editar manualmente',
          permission: PermissoesRotas.MONITOR_OPERACOES_LOTES
        },
        canActivate: [AuthGuard, CanActiveGuard],
      },
    ]
  },
  {
    path: 'monitor-operacoes-lotes/:protocoloLote',
    component: ConsultarOperacoesComponent,
    data: {
      breadcrumb: 'Monitor de operações e lotes',
      permission: PermissoesRotas.MONITOR_OPERACOES_LOTES
    },
    canActivate: [AuthGuard, CanActiveGuard],
    children: [
      {
        path: 'espelho-contrato',
        component: EspelhoContratoComponent,
        data: {
          breadcrumb: 'Espelho de contrato',
          permission: PermissoesRotas.MONITOR_OPERACOES_LOTES
        },
        canActivate: [AuthGuard, CanActiveGuard]
      },
      {
        path: 'visualizar-inconsistencias',
        component: VisualizarInconsistenciasComponent,
        data: {
          breadcrumb: 'Visualizar Inconsistências',
          permission: PermissoesRotas.MONITOR_OPERACOES_LOTES
        },
        canActivate: [AuthGuard, CanActiveGuard],
      },
      {
        path: 'editar-manualmente',
        component: EditarManualmenteComponent,
        data: {
          breadcrumb: 'Editar manualmente',
          permission: PermissoesRotas.MONITOR_OPERACOES_LOTES
        },
        canActivate: [AuthGuard, CanActiveGuard],
      },
    ]
  },
  {
    path: 'notificacoes',
    component: NotificacoesComponent,
    data: {
      breadcrumb: 'Notificações',
      permission: PermissoesRotas.NOTIFICACOES
    },
    canActivate: [CanActiveGuard],
    children: [
      {
        path: 'incluir-notificacao',
        component: CriarNotificacaoComponent,
        data: {
          breadcrumb: 'Incluir notificação',
          permission: PermissoesRotas.NOTIFICACOES_CADASTRAR
        },
        canActivate: [AuthGuard, CanActiveGuard],
      },
      {
        path: 'editar-notificacao/:notificacaoId',
        component: CriarNotificacaoComponent,
        data: {
          breadcrumb: 'Editar notificação',
          permission: PermissoesRotas.NOTIFICACOES
        },
        canActivate: [AuthGuard, CanActiveGuard],
      },
    ]
  },
  {
    path: 'gestao-dudas',
    component: GestaoDudasComponent,
    canActivate: [CanActiveGuard],
    data: {
      breadcrumb: 'Gestão de DUDAs',
      permission: PermissoesRotas.GESTAO_OPERACOES_DUDAS
    },
    loadChildren: () =>
      import('./pages/gestao-dudas/gestao-dudas.module').then(
        (m) => m.GestaoDudasModule
      ),
  },
  {
    path: 'conexao-detrans',
    component: ConexaoDetransComponent,
    canActivate: [CanActiveGuard],
    data: {
      breadcrumb: 'Conexão com DETRANs',
      permission: PermissoesRotas.GESTAO_OPERACOES_CONEXAO_DETRAN
    },
  },
  {
    path: 'central-ajuda',
    component: CentralAjudaComponent,
    data: {
      breadcrumb: 'Central de ajuda',
      permission: PermissoesRotas.CENTRAL_AJUDA
    },
    canActivate: [CanActiveGuard],
    children: [
      {
        path: 'incluir-secao',
        component: CriarSecaoComponent,
        data: {
          breadcrumb: 'Incluir seção',
          permission: PermissoesRotas.CENTRAL_AJUDA_CADASTRAR
        },
        canActivate: [AuthGuard, CanActiveGuard],
      },
      {
        path: 'editar-secao/:secaoId',
        component: CriarSecaoComponent,
        data: {
          breadcrumb: 'Editar seção',
          permission: PermissoesRotas.CENTRAL_AJUDA
        },
        canActivate: [AuthGuard, CanActiveGuard],
      },
      {
        path: 'incluir-artigo',
        component: CriarArtigoComponent,
        data: {
          breadcrumb: 'Incluir artigo',
          permission: PermissoesRotas.CENTRAL_AJUDA_CADASTRAR
        },
        canActivate: [AuthGuard, CanActiveGuard],
      },
      {
        path: 'incluir-artigo/:secaoId',
        component: CriarArtigoComponent,
        data: {
          breadcrumb: 'Incluir artigo',
          permission: PermissoesRotas.CENTRAL_AJUDA_CADASTRAR
        },
        canActivate: [AuthGuard, CanActiveGuard],
      },
      {
        path: 'editar-artigo/:artigoId',
        component: CriarArtigoComponent,
        data: {
          breadcrumb: 'Editar artigo',
          permission: PermissoesRotas.CENTRAL_AJUDA
        },
        canActivate: [AuthGuard, CanActiveGuard],
      }
    ]
  },
  {
    path: 'confirmar-registros',
    component: ConfirmarRegistrosComponent,
    data: {
      breadcrumb: 'Confirmar registros',
      permission: PermissoesRotas.GESTAO_OPERACOES_GRAVAME_CONSULTAR
    },
    canActivate: [CanActiveGuard]
  },
  {
    path: 'configuracoes',
    data: {
      breadcrumb: 'Configurações',
    },
    loadChildren: () =>
      import('./pages/configuracoes/configuracoes.module').then(
        (m) => m.ConfiguracoesModule
      ),
  },
  {
    path: 'administracao',
    data: {
      breadcrumb: '',
    },
    loadChildren: () =>
      import('./pages/administracao/administracao.module').then(
        (m) => m.AdministracaoModule
      ),
  },
  {
    path: 'usuarios-conectados',
    component: UsuariosConectadosComponent,
    data: {
      breadcrumb: 'Usuários conectados',
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrmRoutingModule { }
