import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissoesRotas } from 'src/app/core/common/permissoes-rotas';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { CanActiveGuard } from 'src/app/shared/guards/can-active.guard';
import { ConfiguracoesImagensComponent } from './configuracoes-imagens/configuracoes-imagens.component';
import { RegistrarDetranImagemComponent } from './registrar-detran-imagem/registrar-detran-imagem.component';
import { GestaoBannersComponent } from './gestao-banners/gestao-banners.component';
import { CriarBannerComponent } from './gestao-banners/components/criar-banner/criar-banner.component';

const routes: Routes = [
  {
    path: 'configuracoes-imagens',
    component: ConfiguracoesImagensComponent,
    data: {
      breadcrumb: 'Imagens',
      permission: PermissoesRotas.CONFIGURACOES_ECONTRATO_IMAGENS
    },
    canActivate: [AuthGuard, CanActiveGuard],
    children: [
      {
        path: 'registrar-detran',
        component: RegistrarDetranImagemComponent,
        data: {
          breadcrumb: 'Novo Detran',
          permission: PermissoesRotas.CONFIGURACOES_ECONTRATO_IMAGENS_CADASTRAR
        },
        canActivate: [AuthGuard, CanActiveGuard]
      },
      {
        path: 'editar-detran/:imagemId',
        component: RegistrarDetranImagemComponent,
        data: {
          breadcrumb: 'Editar Detran',
          permission: PermissoesRotas.CONFIGURACOES_ECONTRATO_IMAGENS_CADASTRAR
        },
        canActivate: [AuthGuard, CanActiveGuard]
      },
    ]
  },
  {
    path: 'gestao-banners',
    component: GestaoBannersComponent,
    data: {
      breadcrumb: 'Gestão de banners',
    },
    children: [
      {
        path:'incluir-banner',
        component: CriarBannerComponent,
        data: {
          breadcrumb: 'Novo banner'
        }
      },
      {
        path:'editar-banner/:bannerId',
        component: CriarBannerComponent,
        data: {
          breadcrumb: 'Editar banner'
        }
      }
    ]
  },
  {
    path: 'marcas-modelos',
    data: {
      breadcrumb: 'Marcas e modelos'
    },
    loadChildren: () => import('./marcas-modelos/marcas-modelos.module').then(m => m.MarcasModelosModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EContratoRoutingModule { }
