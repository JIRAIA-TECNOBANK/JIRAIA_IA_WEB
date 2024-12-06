import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { RelatoriosGeradosComponent } from './relatorios-gerados/relatorios-gerados.component';

const routes: Routes = [
  {
    path: '',
    component: RelatoriosGeradosComponent,
    canActivate: [AuthGuard],
    data: {breadcrumb: 'Relatórios gerados'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RelatoriosRoutingModule { }
