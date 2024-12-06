import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/core/guards/auth.guard";
import { MonitorFaturamentoComponent } from "./monitor-faturamento.component";
import { AplicarDescontoComponent } from "./pages/aplicar-desconto/aplicar-desconto.component";
import { CadastrarObservacaoNfNdComponent } from "./pages/cadastrar-observacao-nf-nd/cadastrar-observacao-nf-nd.component";
import { ConsultarDetranComponent } from "./pages/consultar-detran/consultar-detran.component";
import { DetalharPendenciasComponent } from "./pages/detalhar-pendencias/detalhar-pendencias.component";

const routes: Routes = [
    {
        path: '',
        component: MonitorFaturamentoComponent,
        data: {
            breadcrumb: 'Monitor de faturamento'
        },
        canActivate: [AuthGuard]
    },
    {
        path: 'detalhar-pendencias/:conciliacaoId',
        component: DetalharPendenciasComponent,
        data: {
            breadcrumb: 'Detalhar pendências'
        },
        canActivate: [AuthGuard]
    },
    {
        path: 'aplicar-desconto/:faturarId',
        component: AplicarDescontoComponent,
        data: {
            breadcrumb: 'Desconto'
        },
        canActivate: [AuthGuard]
    },
    {
        path: 'consultar-detran',
        component: ConsultarDetranComponent,
        data: {
            breadcrumb: 'Consultar DETRAN'
        },
        canActivate: [AuthGuard]
    },
    {
        path: 'observacao-nf-nd/:faturarId',
        component: CadastrarObservacaoNfNdComponent,
        data: {
            breadcrumb: 'Observação na Nota Fiscal/Nota de Débito'
        },
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class MonitorFaturamentoRoutingModule { }