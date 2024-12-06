import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { MarcasModelosComponent } from './marcas-modelos.component';
import { EditarModelosComponent } from './pages/editar-modelos/editar-modelos.component';

const routes: Routes = [
  {
    path: '',
    component: MarcasModelosComponent,
    data: {
      breadcrumb: 'Marcas e modelos',
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'editar-modelos/:marcaId',
    component: EditarModelosComponent,
    data: {
      breadcrumb: 'Editar modelos',
    },
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MarcasModelosRoutingModule {}
