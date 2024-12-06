import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';

import { PermissoesRotas } from 'src/app/core/common/permissoes-rotas';
import { CanActiveGuard } from 'src/app/shared/guards/can-active.guard';

const routes: Routes = [
    {
        path: 'gestao-detrans',
        canActivate: [AuthGuard, CanActiveGuard],
        data: {
            breadcrumb: 'Gestão de DETRANs',
            permission: PermissoesRotas.GESTAO_DETRANS
        },
        loadChildren: () => import('./gestao-detrans/gestao-detrans.module').then(m => m.GestaoDetransModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdministracaoRoutingModule { }
