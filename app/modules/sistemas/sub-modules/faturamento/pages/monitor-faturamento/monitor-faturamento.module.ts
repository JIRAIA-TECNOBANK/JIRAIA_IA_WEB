import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "src/app/shared/shared.module";
import { TableConciliacaoComponent } from "./components/table-conciliacao/table-conciliacao.component";
import { TablePendenciasComponent } from "./components/table-pendencias/table-pendencias.component";
import { MonitorFaturamentoComponent } from "./monitor-faturamento.component";
import { MonitorFaturamentoRoutingModule } from "./monitor-faturamento.routing.module";
import { TableDetalharPendenciasComponent } from "./pages/detalhar-pendencias/components/table-detalhar-pendencias/table-detalhar-pendencias.component";
import { DetalharPendenciasComponent } from "./pages/detalhar-pendencias/detalhar-pendencias.component";

import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatSortModule } from "@angular/material/sort";
import { CurrencyMaskModule } from "ng2-currency-mask";
import { NgxMaskModule } from "ngx-mask";
import { DialogConfirmarTaxasComponent } from "../gestao-detrans/components/dialog-confirmar-taxas/dialog-confirmar-taxas.component";
import { DialogConsultarStatusComponent } from "./components/dialog-consultar-status/dialog-consultar-status.component";
import { DialogExportarArquivosComponent } from "./components/dialog-exportar-arquivos/dialog-exportar-arquivos.component";
import { DialogInformativoComponent } from "./components/dialog-informativo/dialog-informativo.component";
import { ExcluirCobrancaComponent } from "./components/excluir-cobranca/excluir-cobranca.component";
import { FiltroConciliacaoComponent } from "./components/filtro-conciliacao/filtro-conciliacao.component";
import { FiltroFaturadoComponent } from "./components/filtro-faturado/filtro-faturado.component";
import { FiltroPendenciasComponent } from "./components/filtro-pendencias/filtro-pendencias.component";
import { TableFaturadoComponent } from "./components/table-faturado/table-faturado.component";
import { TableFaturarComponent } from "./components/table-faturar/table-faturar.component";
import { AplicarDescontoComponent } from "./pages/aplicar-desconto/aplicar-desconto.component";
import { CadastrarObservacaoNfNdComponent } from "./pages/cadastrar-observacao-nf-nd/cadastrar-observacao-nf-nd.component";
import { TableConsultarDetranComponent } from "./pages/consultar-detran/components/table-consultar-detran/table-consultar-detran.component";
import { ConsultarDetranComponent } from "./pages/consultar-detran/consultar-detran.component";
import { DialogExcluirDuplicidadeComponent } from "./pages/detalhar-pendencias/components/dialog-excluir-duplicidade/dialog-excluir-duplicidade.component";
import { DialogReprocessarComponent } from "./pages/detalhar-pendencias/components/dialog-reprocessar/dialog-reprocessar.component";

@NgModule({
    declarations: [
        MonitorFaturamentoComponent,
        TableConciliacaoComponent,
        TablePendenciasComponent,
        DetalharPendenciasComponent,
        TableDetalharPendenciasComponent,
        ExcluirCobrancaComponent,
        DialogConfirmarTaxasComponent,
        DialogExcluirDuplicidadeComponent,
        DialogReprocessarComponent,
        TableFaturarComponent,
        AplicarDescontoComponent,
        TableFaturadoComponent,
        FiltroPendenciasComponent,
        FiltroConciliacaoComponent,
        FiltroFaturadoComponent,
        ConsultarDetranComponent,
        TableConsultarDetranComponent,
        DialogConsultarStatusComponent,
        DialogExportarArquivosComponent,
        CadastrarObservacaoNfNdComponent,
        DialogInformativoComponent
    ],
    imports: [
        CommonModule,
        MonitorFaturamentoRoutingModule,
        SharedModule,
        FlexLayoutModule,
        SharedModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatGridListModule,
        MatInputModule,
        MatMenuModule,
        MatTooltipModule,
        MatTableModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatDialogModule,
        MatButtonToggleModule,
        MatDatepickerModule,
        CurrencyMaskModule,
        MatExpansionModule,
        MatRadioModule,
        MatNativeDateModule,
        MatChipsModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatSortModule,
        MatIconModule,
        MatPaginatorModule,
        MatSelectModule,
        CurrencyMaskModule,
        
        NgxMaskModule.forChild()
    ]
})
export class MonitorFaturamentoModule { }