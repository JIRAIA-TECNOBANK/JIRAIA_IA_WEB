import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { CriarTaxaDetranComponent } from './pages/gestao-detrans/components/criar-taxa-detran/criar-taxa-detran.component';
import { ListaTaxaDetranComponent } from './pages/gestao-detrans/components/lista-taxa-detran/lista-taxa-detran.component';
import { TaxaDetranComponent } from './pages/gestao-detrans/components/taxa-detran/taxa-detran.component';

import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';

import { SharedModule } from 'src/app/shared/shared.module';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { NgxMaskModule } from 'ngx-mask';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { CURRENCY_MASK_CONFIG, CurrencyMaskConfig, CurrencyMaskModule } from "ng2-currency-mask";

import { MatIconModule } from '@angular/material/icon';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { CriarPrecoTbkComponent } from './pages/gestao-detrans/components/criar-preco-tbk/criar-preco-tbk.component';
import { ListaPrecoTbkComponent } from './pages/gestao-detrans/components/lista-preco-tbk/lista-preco-tbk.component';
import { PrecoTbkComponent } from './pages/gestao-detrans/components/preco-tbk/preco-tbk.component';
import { EmpresaFaturamentoService } from './services/empresa.service';
import { PrecoService } from './services/preco.service';

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
  align: "left",
  allowNegative: false,
  decimal: ",",
  precision: 2,
  prefix: "R$ ",
  suffix: "",
  thousands: "."
};

import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatSortModule } from '@angular/material/sort';
import { FORMATO_DATA } from '../../core/models/common/formato-date-picker.model';
import { FaturamentoRoutingModule } from './faturamento-routing.module';
import { CestaServicoEmpresaComponent } from './pages/empresas/components/cesta-servico-empresa/cesta-servico-empresa.component';
import { ConsolidacaoNotasComponent } from './pages/empresas/components/consolidacao-notas/consolidacao-notas.component';
import { DadosCobrancaComponent } from './pages/empresas/components/dados-cobranca/dados-cobranca.component';
import { DadosPagadorCobrancaComponent } from './pages/empresas/components/dados-pagador-cobranca/dados-pagador-cobranca.component';
import { DialogEditarVigenciaCestaComponent } from './pages/empresas/components/dialog-editar-vigencia-cesta/dialog-editar-vigencia-cesta.component';
import { DialogPesquisaCestaComponent } from './pages/empresas/components/dialog-pesquisa-cesta/dialog-pesquisa-cesta.component';
import { EscolhaVigenciaCestaComponent } from './pages/empresas/components/escolha-vigencia-cesta/escolha-vigencia-cesta.component';
import { GerarInfoContabeisComponent } from './pages/empresas/components/gerar-info-contabeis/gerar-info-contabeis.component';
import { GerenciarNotificacoesComponent } from './pages/empresas/components/gerenciar-notificacoes/gerenciar-notificacoes.component';
import { FiltroCancelamentoNfNdComponent } from './pages/gestao-aprovacoes/components/filtro-cancelamento-nf-nd/filtro-cancelamento-nf-nd.component';
import { FiltroCestaServicoComponent } from './pages/gestao-aprovacoes/components/filtro-cesta-servico/filtro-cesta-servico.component';
import { TableCancelamentoNfNdComponent } from './pages/gestao-aprovacoes/components/table-cancelamento-nf-nd/table-cancelamento-nf-nd.component';
import { TableCestaServicoComponent } from './pages/gestao-aprovacoes/components/table-cesta-servico/table-cesta-servico.component';
import { GestaoAprovacoesComponent } from './pages/gestao-aprovacoes/gestao-aprovacoes.component';
import { TabelaListagemPrecosComponent } from './pages/gestao-detrans/components/tabela-listagem-precos/tabela-listagem-precos.component';
import { MonitorFaturamentoModule } from './pages/monitor-faturamento/monitor-faturamento.module';
import { DialogSolicitarRelatorioFaturamentoComponent } from './pages/relatorios/components/dialog-solicitar-relatorio-faturamento/dialog-solicitar-relatorio-faturamento.component';
import { TableRelatoriosFaturamentoComponent } from './pages/relatorios/components/table-relatorios-faturamento/table-relatorios-faturamento.component';
import { RelatoriosComponent } from './pages/relatorios/relatorios.component';
import { DialogEnviarArquivosDetranComponent } from './pages/upload-detran/components/dialog-enviar-arquivos-detran/dialog-enviar-arquivos-detran.component';
import { UploadDetranComponent } from './pages/upload-detran/upload-detran.component';
import { FaturamentoAprovacaoService } from './services/aprovacao.service';
import { DetranService } from './services/detran.service';
import { FaturamentoConciliadoService } from './services/faturamento-conciliado.service';
import { RelatorioFinanceiroService } from './services/relatorio-financeiro.service';
import { TaxaService } from './services/taxa.service';

@NgModule({
  declarations: [
    TaxaDetranComponent,
    CriarTaxaDetranComponent,
    ListaTaxaDetranComponent,
    PrecoTbkComponent,
    ListaPrecoTbkComponent,
    CriarPrecoTbkComponent,
    DadosCobrancaComponent,
    CestaServicoEmpresaComponent,
    DialogPesquisaCestaComponent,
    RelatoriosComponent,
    TableRelatoriosFaturamentoComponent,
    DialogSolicitarRelatorioFaturamentoComponent,
    UploadDetranComponent,
    DialogEnviarArquivosDetranComponent,
    TabelaListagemPrecosComponent,
    GerenciarNotificacoesComponent,
    ConsolidacaoNotasComponent,
    DadosPagadorCobrancaComponent,
    GerarInfoContabeisComponent,
    GestaoAprovacoesComponent,
    FiltroCancelamentoNfNdComponent,
    TableCancelamentoNfNdComponent,
    EscolhaVigenciaCestaComponent,
    DialogEditarVigenciaCestaComponent,
    FiltroCestaServicoComponent,
    TableCestaServicoComponent
  ],
  imports: [
    CommonModule,
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
    MatAutocompleteModule,
    AngularEditorModule,
    MatRadioModule,
    MatNativeDateModule,
    MatChipsModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    FaturamentoRoutingModule,
    MatSortModule,
    MatIconModule,
    MatPaginatorModule,
    MatSelectModule,
    MonitorFaturamentoModule,
    NgxMaskModule.forChild(),
  ],
  exports: [
    TaxaDetranComponent,
    CriarTaxaDetranComponent,
    ListaTaxaDetranComponent,
    PrecoTbkComponent,
    ListaPrecoTbkComponent,
    CriarPrecoTbkComponent,
    DadosCobrancaComponent,
    CestaServicoEmpresaComponent,
    GerenciarNotificacoesComponent,
    ConsolidacaoNotasComponent,
    DadosPagadorCobrancaComponent,
    GerarInfoContabeisComponent,
    TabelaListagemPrecosComponent
  ],
  providers: [
    RelatorioFinanceiroService,
    TaxaService,
    PrecoService,
    EmpresaFaturamentoService,
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'pt-BR',
    },
    {
      provide: CURRENCY_MASK_CONFIG,
      useValue: CustomCurrencyMaskConfig
    },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: FORMATO_DATA },
    FaturamentoConciliadoService,
    DetranService,
    FaturamentoAprovacaoService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FaturamentoModule {
  constructor(private injector: Injector) {
    appInjector = this.injector;
  }
}

export let appInjector: Injector;
