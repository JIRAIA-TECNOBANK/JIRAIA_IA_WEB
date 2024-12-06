import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { CriarPerfilComponent } from './perfis/components/criar-perfil/criar-perfil.component';
import { CriarAreasComponent } from './areas/components/criar-areas/criar-areas.component';
import { CriarUsuarioComponent } from './usuarios/components/criar-usuario/criar-usuario.component';
import { PerfisComponent } from './perfis/perfis.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { AreasComponent } from './areas/areas.component';
import { CanActiveGuard } from 'src/app/shared/guards/can-active.guard';
import { PermissoesRotas } from 'src/app/core/common/permissoes-rotas';

const routes: Routes = [
  {
    path: 'usuarios',
    component: UsuariosComponent,
    canActivate: [AuthGuard],
    data: {
      breadcrumb: 'Usuários',
      permission: PermissoesRotas.ACESSOS_USUARIO_INTERNO
    },
    children: [
      {
        path: 'incluir-usuario',
        component: CriarUsuarioComponent,
        data: {
          breadcrumb: 'Novo usuário',
          permission: PermissoesRotas.ACESSOS_USUARIO_INTERNO_CADASTRAR
        },
        canActivate: [AuthGuard, CanActiveGuard]
      },
      {
        path: 'editar-usuario/:usuarioId',
        component: CriarUsuarioComponent,
        data: {
          breadcrumb: 'Editar usuário',
          permission: PermissoesRotas.ACESSOS_USUARIO_INTERNO
        },
        canActivate: [AuthGuard, CanActiveGuard]
      },
    ]
  },
  {
    path: 'areas',
    component: AreasComponent,
    data: {
      breadcrumb: 'Áreas',
      permission: PermissoesRotas.ACESSOS_USUARIO_INTERNO
    },
    canActivate: [AuthGuard, CanActiveGuard],
    children: [
      {
        path: 'incluir-area',
        component: CriarAreasComponent,
        data: {
          breadcrumb: 'Nova área',
          permission: PermissoesRotas.ACESSOS_USUARIO_INTERNO_CADASTRAR
        },
        canActivate: [AuthGuard, CanActiveGuard]
      },
      {
        path: 'editar-area/:areaId',
        component: CriarAreasComponent,
        data: {
          breadcrumb: 'Editar área',
          permission: PermissoesRotas.ACESSOS_USUARIO_INTERNO_CADASTRAR
        },
        canActivate: [AuthGuard, CanActiveGuard]
      }
    ]
  },
  {
    path: 'perfis',
    component: PerfisComponent,
    data: {
      breadcrumb: 'Perfis',
      permission: PermissoesRotas.ACESSOS_USUARIO_INTERNO
    },
    canActivate: [AuthGuard, CanActiveGuard],
    children: [
      {
        path: 'incluir-perfil',
        component: CriarPerfilComponent,
        data: {
          breadcrumb: 'Novo perfil',
          permission: PermissoesRotas.ACESSOS_USUARIO_INTERNO_CADASTRAR
        },
        canActivate: [AuthGuard, CanActiveGuard]
      },
      {
        path: 'editar-perfil/:perfilId',
        component: CriarPerfilComponent,
        data: {
          breadcrumb: 'Editar perfil',
          permission: PermissoesRotas.ACESSOS_USUARIO_INTERNO
        },
        canActivate: [AuthGuard, CanActiveGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AcessosRoutingModule { }
