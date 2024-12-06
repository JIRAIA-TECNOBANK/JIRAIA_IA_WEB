import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/core/guards/auth.guard";
import { StepperParametrizarDetranComponent } from "./components/stepper-parametrizar-detran/stepper-parametrizar-detran.component";
import { GestaoDetransComponent } from "./gestao-detrans.component";

const routes: Routes = [
    {
        path: '',
        component: GestaoDetransComponent,
        data: {
            breadcrumb: 'Gestão de DETRANs',
        }
    },
    {
        path: 'editar-detran/:detranId',
        component: StepperParametrizarDetranComponent,
        data: {
            breadcrumb: 'Editar DETRAN'
        },
        canActivate: [AuthGuard],
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GestaoDetransRoutingModule { }