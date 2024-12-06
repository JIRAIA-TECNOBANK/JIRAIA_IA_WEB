import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { CanActiveGuard } from 'src/app/shared/guards/can-active.guard';
import { PermissoesRotas } from 'src/app/core/common/permissoes-rotas';
import { DetransComponent } from './pages/detrans/detrans-list/detrans-list.component';
import { DetransRegisterComponent } from './pages/detrans/detrans-register/detrans-register.component';
import { AplicacoesComponent } from './pages/aplicacoes/aplicacoes-list/aplicacoes-list.component';
import { AplicacoesRegisterComponent } from './pages/aplicacoes/aplicacoes-register/aplicacoes-register.component';
import { ProtocolosComponent } from './pages/protocolos/protocolos-list/protocolos-list.component';
import { ProtocolosRegisterComponent } from './pages/protocolos/protocolos-register/protocolos-register.component';

const routes: Routes = [
  // Rota para Detrans
  {
    path: 'egarantia-detrans',
    data: {
      breadcrumb: 'Detrans'
    },
    children: [
      {
        path: '',
        component: DetransComponent,
        data: {
          breadcrumb: '',
          permission: PermissoesRotas.NOTIFICACOES
        },
        canActivate: [CanActiveGuard]
      },
      {
        path: 'incluir-detran',
        component: DetransRegisterComponent,
        data: {
          breadcrumb: 'Cadastrar Detran',
          permission: PermissoesRotas.NOTIFICACOES
        },
        canActivate: [CanActiveGuard]
      }
    ]
  },

  // Rota para Aplicações
  {
    path: 'egarantia-aplicacoes',
    data: {
      breadcrumb: 'Aplicações'
    },
    children: [
      {
        path: '',
        component: AplicacoesComponent,
        data: {
          breadcrumb: '',
          permission: PermissoesRotas.NOTIFICACOES
        },
        canActivate: [CanActiveGuard]
      },
      {
        path: 'incluir-aplicacao',
        component: AplicacoesRegisterComponent,
        data: {
          breadcrumb: 'Cadastrar Aplicação',
          permission: PermissoesRotas.NOTIFICACOES
        },
        canActivate: [CanActiveGuard]
      }
    ]
  },

  // Rota para Aplicações
  {
    path: 'egarantia-protocolos',
    data: {
      breadcrumb: 'Protocolos'
    },
    children: [
      {
        path: '',
        component: ProtocolosComponent,
        data: {
          breadcrumb: '',
          permission: PermissoesRotas.NOTIFICACOES
        },
        canActivate: [CanActiveGuard]
      },
      {
        path: 'incluir-protocolo',
        component: ProtocolosRegisterComponent,
        data: {
          breadcrumb: 'Visualizar Protocolo',
          permission: PermissoesRotas.NOTIFICACOES
        },
        canActivate: [CanActiveGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class eGarantiaRoutingModule { }
