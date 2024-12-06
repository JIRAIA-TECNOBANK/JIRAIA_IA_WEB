import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { MonitorRegulatorioComponent } from './pages/monitor-regulatorio/monitor-regulatorio.component';
import { NormativosComponent } from './pages/normativos/normativos.component';
import { CriarNormativoComponent } from './pages/criar-normativo/criar-normativo.component';
import { RegistrosComponent } from './pages/registros/registros.component';
import { CriarRegistroComponent } from './pages/criar-registro/criar-registro.component';
import { CriarGarantiaComponent } from './pages/criar-garantia/criar-garantia.component';
import { CriarInstituicaoComponent } from './pages/criar-instituicao/criar-instituicao.component';
import { ContatosComponent } from './pages/contatos/contatos.component';
import { CriarContatosComponent } from './pages/criar-contatos/criar-contatos.component';
import { ChatComponent } from './pages/chat/chat.component';
import { MonitorNormativoComponent } from './pages/monitor-normativo/monitor-normativo.component';

const routes: Routes = [
  { path: '', redirectTo: 'monitor-regulatorio', pathMatch: 'full' },
  {
    path: 'monitor-regulatorio',
    component: MonitorRegulatorioComponent,
    canActivate: [AuthGuard],
    data: {
      breadcrumb: 'Monitor regulatório',
    },
  },
  {
    path: 'hackaton-chat',
    component: ChatComponent,
    canActivate: [AuthGuard],
    data: {
      breadcrumb: 'Chat JiraIA',
    },
  },
  {
    path: 'monitor-normativo',
    component: MonitorNormativoComponent,
    canActivate: [AuthGuard],
    data: {
      breadcrumb: 'Monitor Normativo',
    },
  },
  {
    path: 'normativos',
    component: NormativosComponent,
    canActivate: [AuthGuard],
    data: {
      breadcrumb: 'Normativos',
    },
    children: [
      {
        path: 'incluir-normativo',
        component: CriarNormativoComponent,
        data: {
          breadcrumb: 'Incluir normativo',
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'editar-normativo/:idNormativo',
        component: CriarNormativoComponent,
        data: {
          breadcrumb: 'Editar normativo',
        },
        canActivate: [AuthGuard]
      },
    ]
  },
  {
    path: 'registros',
    component: RegistrosComponent,
    canActivate: [AuthGuard],
    data: {
      breadcrumb: 'Registros',
    },
    children: [
      {
        path: 'incluir-registro',
        component: CriarRegistroComponent,
        data: {
          breadcrumb: 'Incluir registro de contrato',
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'editar-registro/:idRegistro',
        component: CriarRegistroComponent,
        data: {
          breadcrumb: 'Editar registro de contrato',
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'incluir-garantia',
        component: CriarGarantiaComponent,
        data: {
          breadcrumb: 'Incluir registro de garantia',
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'editar-garantia/:idGarantia',
        component: CriarGarantiaComponent,
        data: {
          breadcrumb: 'Editar registro de garantia',
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'incluir-instituicao',
        component: CriarInstituicaoComponent,
        data: {
          breadcrumb: 'Incluir registro de instituição financeira',
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'editar-instituicao/:idInstituicao',
        component: CriarInstituicaoComponent,
        data: {
          breadcrumb: 'Editar registro de instituição financeira',
        },
        canActivate: [AuthGuard]
      },
    ]
  },
  {
    path: 'contatos',
    component: ContatosComponent,
    canActivate: [AuthGuard],
    data: {
      breadcrumb: 'Registro de contato',
    },
    children: [
      {
        path: 'incluir-contato',
        component: CriarContatosComponent,
        data: {
          breadcrumb: 'Incluir contato',
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'editar-contato/:idContato',
        component: CriarContatosComponent,
        data: {
          breadcrumb: 'Editar contato',
        },
        canActivate: [AuthGuard]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JuridicoRoutingModule { }
