import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';

import { PermissoesRotas } from 'src/app/core/common/permissoes-rotas';
import { CanActiveGuard } from 'src/app/shared/guards/can-active.guard';
import { CriarPerfilComponent } from './components/gestao-acessos/perfis/criar-perfil/criar-perfil.component';
import { CriarEmpresaComponent } from './pages/criar-empresa/criar-empresa.component';
import { CriarUsuarioSrdComponent } from './pages/criar-usuario-srd/criar-usuario-srd.component';
import { CriarUsuarioComponent } from './pages/criar-usuario/criar-usuario.component';
import { GestaoAcessosComponent } from './pages/gestao-acessos/gestao-acessos.component';
import { ProdutosComponent } from './pages/produtos/produtos.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'organizacoes',
    pathMatch: 'full'
  },
  {
    path: 'criar-empresa',
    component: CriarEmpresaComponent,
    data: {
      breadcrumb: 'Nova empresa',
      permission: PermissoesRotas.GESTAO_EMPRESAS_CADASTRAR
    },
    canActivate: [AuthGuard, CanActiveGuard],
  },
  {
    path: 'atualizar-empresa/:empresaId',
    component: CriarEmpresaComponent,
    data: {
      breadcrumb: 'Editar empresa',
      permission: PermissoesRotas.GESTAO_EMPRESAS_GRUPOS
    },
    canActivate: [AuthGuard, CanActiveGuard],
    children: [
      {
        path: 'produtos',
        component: ProdutosComponent,
        data: {
          breadcrumb: 'Produtos',
          permission: PermissoesRotas.GESTAO_EMPRESAS_GRUPOS
        },
        canActivate: [CanActiveGuard],
      },
    ],
  },
  {
    path: 'gestao-acessos/:empresaId',
    component: GestaoAcessosComponent,
    data: {
      breadcrumb: 'Gestão de acessos',
      permission: PermissoesRotas.GESTAO_EMPRESAS_ACESSOS
    },
    canActivate: [AuthGuard, CanActiveGuard],
    children: [
      {
        path: 'criar-usuario',
        component: CriarUsuarioComponent,
        data: {
          breadcrumb: 'Novo usuário',
          permission: PermissoesRotas.GESTAO_EMPRESAS_ACESSOS_CADASTRAR
        },
        canActivate: [AuthGuard, CanActiveGuard],
      },
      {
        path: 'atualizar-usuario/:usuarioGuid',
        component: CriarUsuarioComponent,
        data: {
          breadcrumb: 'Editar usuário',
          permission: PermissoesRotas.GESTAO_EMPRESAS_ACESSOS
        },
        canActivate: [AuthGuard, CanActiveGuard],
      },

      // Perfil
      {
        path: 'criar-perfil',
        component: CriarPerfilComponent,
        data: {
          breadcrumb: 'Novo perfil',
          permission: PermissoesRotas.GESTAO_EMPRESAS_ACESSOS_CADASTRAR
        },
        canActivate: [AuthGuard, CanActiveGuard],
      },
      {
        path: 'atualizar-perfil/:perfilId',
        component: CriarPerfilComponent,
        data: {
          breadcrumb: 'Editar perfil',
          permission: PermissoesRotas.GESTAO_EMPRESAS_ACESSOS_CADASTRAR
        },
        canActivate: [AuthGuard, CanActiveGuard],
      },

      {
        path: 'criar-usuario-srd',
        component: CriarUsuarioSrdComponent,
        data: {
          breadcrumb: 'Novo usuário SRD',
          permission: PermissoesRotas.GESTAO_EMPRESAS_ACESSOS_CADASTRAR
        },
        canActivate: [AuthGuard, CanActiveGuard],
      },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmpresasRoutingModule { }
