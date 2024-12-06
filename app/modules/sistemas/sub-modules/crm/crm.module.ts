import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';

import { AppSettings } from 'src/app/configs/app-settings.config';
import { SharedModule } from 'src/app/shared/shared.module';
import { CrmRoutingModule } from './crm-routing.module';
import { EmpresasModule } from './pages/empresas/empresas.module';
import { GrupoEconomicoModule } from './pages/grupo-economico/grupo-economico.module';
import { HomeCrmComponent } from './pages/home-crm/home-crm.component';
import { DominioService } from './services/dominio.service';
import { EmpresasService } from './services/empresas.service';
import { GeograficoService } from './services/geografico.service';
import { GrupoPermissoesService } from './services/grupo-permissoes.service';
import { GruposEconomicosService } from './services/grupos-economicos.service';
import { PerfisService } from './services/perfis.service';
import { ProdutosService } from './services/produtos.service';
import { UsuariosEmpresaService } from './services/usuarios-empresa.service';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatSortModule } from '@angular/material/sort';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { NgxMaskModule } from 'ngx-mask';
import { AtividadesRecentesComponent } from './pages/conexao-detrans/components/atividades-recentes/atividades-recentes.component';
import { MapaConexaoComponent } from './pages/conexao-detrans/components/mapa-conexao/mapa-conexao.component';
import { ConexaoDetransComponent } from './pages/conexao-detrans/conexao-detrans.component';
import { CentralAjudaComponent } from './pages/operacional/central-ajuda/central-ajuda.component';
import { CriarSecaoComponent } from './pages/operacional/central-ajuda/components/criar-secao/criar-secao.component';
import { ListarArtigosComponent } from './pages/operacional/central-ajuda/components/listar-artigos/listar-artigos.component';
import { TableArtigosComponent } from './pages/operacional/central-ajuda/components/table-artigos/table-artigos.component';
import { TableSecoesComponent } from './pages/operacional/central-ajuda/components/table-secoes/table-secoes.component';
import { DadosComplementaresComponent } from './pages/operacional/editar-manualmente/components/dados-complementares/dados-complementares.component';
import { DadosContratoComponent } from './pages/operacional/editar-manualmente/components/dados-contrato/dados-contrato.component';
import { DadosCredorComponent } from './pages/operacional/editar-manualmente/components/dados-credor/dados-credor.component';
import { DadosDevedorComponent } from './pages/operacional/editar-manualmente/components/dados-devedor/dados-devedor.component';
import { DadosFinanciamentoComponent } from './pages/operacional/editar-manualmente/components/dados-financiamento/dados-financiamento.component';
import { DadosVeiculoListComponent } from './pages/operacional/editar-manualmente/components/dados-veiculo-list/dados-veiculo-list.component';
import { DadosVeiculoComponent } from './pages/operacional/editar-manualmente/components/dados-veiculo/dados-veiculo.component';
import { DialogVerVeiculoComponent } from './pages/operacional/editar-manualmente/components/dialog-ver-veiculo/dialog-ver-veiculo.component';
import { EditarManualmenteComponent } from './pages/operacional/editar-manualmente/editar-manualmente.component';
import { DialogDsMensagemComponent } from './pages/operacional/monitor-operacoes/components/dialog-ds-mensagem/dialog-ds-mensagem.component';
import { RelatoriosModule } from './pages/relatorios/relatorios.module';
import { UsuariosApiService } from './services/usuario-api.service';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { CURRENCY_MASK_CONFIG, CurrencyMaskConfig, CurrencyMaskModule } from "ng2-currency-mask";
import { EspelhoAdmConsorciosComponent } from './pages/operacional/espelho-contrato/components/espelho-adm-consorcios/espelho-adm-consorcios.component';
import { EspelhoDadosComplementaresComponent } from './pages/operacional/espelho-contrato/components/espelho-dados-complementares/espelho-dados-complementares.component';
import { EspelhoDadosContratoComponent } from './pages/operacional/espelho-contrato/components/espelho-dados-contrato/espelho-dados-contrato.component';
import { EspelhoDadosCredorComponent } from './pages/operacional/espelho-contrato/components/espelho-dados-credor/espelho-dados-credor.component';
import { EspelhoDadosDevedorComponent } from './pages/operacional/espelho-contrato/components/espelho-dados-devedor/espelho-dados-devedor.component';
import { EspelhoDadosFinanciamentoComponent } from './pages/operacional/espelho-contrato/components/espelho-dados-financiamento/espelho-dados-financiamento.component';
import { EspelhoDadosGarantidorComponent } from './pages/operacional/espelho-contrato/components/espelho-dados-garantidor/espelho-dados-garantidor.component';
import { EspelhoDadosNsaProtocoloComponent } from './pages/operacional/espelho-contrato/components/espelho-dados-nsa-protocolo/espelho-dados-nsa-protocolo.component';
import { EspelhoDadosVeiculoComponent } from './pages/operacional/espelho-contrato/components/espelho-dados-veiculo/espelho-dados-veiculo.component';
import { LiberacaoAcessoComponent } from './pages/operacional/espelho-contrato/components/liberacao-acesso/liberacao-acesso.component';
import { EspelhoContratoComponent } from './pages/operacional/espelho-contrato/espelho-contrato.component';
import { DialogEmitirCertidaoComponent } from './pages/operacional/monitor-operacoes/components/dialog-emitir-certidao/dialog-emitir-certidao.component';
import { EnviaArquivoLoteComponent } from './pages/operacional/monitor-operacoes/components/envia-arquivo-lote/envia-arquivo-lote.component';
import { ResultadoConsultaComponent } from './pages/operacional/monitor-operacoes/components/resultado-consulta/resultado-consulta.component';
import { TableLotesComponent } from './pages/operacional/monitor-operacoes/components/table-lotes/table-lotes.component';
import { ConsultarOperacoesComponent } from './pages/operacional/monitor-operacoes/consultar-operacoes/consultar-operacoes.component';
import { CriarNotificacaoComponent } from './pages/operacional/notificacoes/components/criar-notificacao/criar-notificacao.component';
import { NotificacoesComponent } from './pages/operacional/notificacoes/notificacoes.component';
import { VisualizarInconsistenciasDadosComplementarComponent } from './pages/operacional/visualizar-inconsistencias/components/dados-complementar/dados-complementar.component';
import { VisualizarInconsistenciasDadosContratoComponent } from './pages/operacional/visualizar-inconsistencias/components/dados-contrato/dados-contrato.component';
import { VisualizarInconsistenciasDadosCredorComponent } from './pages/operacional/visualizar-inconsistencias/components/dados-credor/dados-credor.component';
import { VisualizarInconsistenciasDadosDevedorComponent } from './pages/operacional/visualizar-inconsistencias/components/dados-devedor/dados-devedor.component';
import { VisualizarInconsistenciasDadosFinanciamentoComponent } from './pages/operacional/visualizar-inconsistencias/components/dados-financiamento/dados-financiamento.component';
import { VisualizarInconsistenciasDadosVeiculoComponent } from './pages/operacional/visualizar-inconsistencias/components/dados-veiculo/dados-veiculo.component';
import { VisualizarInconsistenciasTerceiroGarantidorComponent } from './pages/operacional/visualizar-inconsistencias/components/terceiro-garantidor/terceiro-garantidor.component';
import { VisualizarInconsistenciasComponent } from './pages/operacional/visualizar-inconsistencias/visualizar-inconsistencias.component';

import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { FORMATO_DATA } from '../../core/models/common/formato-date-picker.model';
import { AdministracaoModule } from './pages/administracao/administracao.module';
import { CriarArtigoComponent } from './pages/operacional/central-ajuda/components/criar-artigo/criar-artigo.component';
import { DialogComplementarComponent } from './pages/operacional/central-ajuda/components/dialog-complementar/dialog-complementar.component';
import { DialogConfirmarReprocessamentoComponent } from './pages/operacional/monitor-operacoes/components/dialog-confirmar-reprocessamento/dialog-confirmar-reprocessamento.component';
import { DialogReprocessarComponent } from './pages/operacional/monitor-operacoes/components/dialog-reprocessar/dialog-reprocessar.component';
import { UsuariosConectadosComponent } from './pages/operacional/usuarios-conectados/usuarios-conectados.component';
import { ResumoComponent } from './pages/operacional/visualizar-inconsistencias/components/resumo/resumo.component';
import { EditarManualmenteService } from './services/editar-manualmente.service';
import { NotificacaoService } from './services/notificacao.service';
import { UsuarioServicoService } from './services/usuario-servico.service';
import { VeiculoService } from './services/veiculo.service';

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
  align: "left",
  allowNegative: false,
  decimal: ",",
  precision: 2,
  prefix: "R$ ",
  suffix: "",
  thousands: "."
};

@NgModule({
  declarations: [
    HomeCrmComponent,

    ConsultarOperacoesComponent,
    ResultadoConsultaComponent,
    TableLotesComponent,
    EnviaArquivoLoteComponent,

    EditarManualmenteComponent,
    DadosVeiculoComponent,
    DadosContratoComponent,
    DadosComplementaresComponent,
    DadosFinanciamentoComponent,
    DadosCredorComponent,
    DadosDevedorComponent,
    DialogVerVeiculoComponent,
    DadosVeiculoListComponent,
    DialogDsMensagemComponent,

    EspelhoContratoComponent,
    EspelhoDadosVeiculoComponent,
    EspelhoDadosContratoComponent,
    EspelhoDadosComplementaresComponent,
    EspelhoDadosFinanciamentoComponent,
    EspelhoDadosCredorComponent,
    EspelhoDadosDevedorComponent,
    EspelhoDadosGarantidorComponent,
    EspelhoDadosNsaProtocoloComponent,
    EspelhoAdmConsorciosComponent,
    LiberacaoAcessoComponent,

    VisualizarInconsistenciasComponent,
    VisualizarInconsistenciasDadosComplementarComponent,
    VisualizarInconsistenciasDadosContratoComponent,
    VisualizarInconsistenciasDadosCredorComponent,
    VisualizarInconsistenciasDadosDevedorComponent,
    VisualizarInconsistenciasDadosFinanciamentoComponent,
    VisualizarInconsistenciasDadosVeiculoComponent,
    VisualizarInconsistenciasTerceiroGarantidorComponent,

    ConexaoDetransComponent,
    MapaConexaoComponent,
    AtividadesRecentesComponent,

    CentralAjudaComponent,
    TableSecoesComponent,
    CriarSecaoComponent,
    TableArtigosComponent,
    ListarArtigosComponent,
    CriarArtigoComponent,
    DialogComplementarComponent,

    NotificacoesComponent,
    CriarNotificacaoComponent,

    DialogEmitirCertidaoComponent,
      ResumoComponent,
      DialogReprocessarComponent,
      DialogConfirmarReprocessamentoComponent,
      UsuariosConectadosComponent,
  ],
  imports: [
    EmpresasModule,
    RelatoriosModule,
    GrupoEconomicoModule,
    AdministracaoModule,
    CommonModule,
    FlexLayoutModule,
    CrmRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTooltipModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTabsModule,
    MatDialogModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    CurrencyMaskModule,
    MatExpansionModule,
    MatAutocompleteModule,
    AngularEditorModule,
    MatRadioModule,
    DragDropModule,
    MatNativeDateModule,
    MatChipsModule,
    MatCheckboxModule,
    NgxMaskModule.forChild(),
  ],
  exports: [
    MapaConexaoComponent
  ],
  providers: [
    AppSettings,
    EmpresasService,
    DominioService,
    ProdutosService,
    GruposEconomicosService,
    UsuariosEmpresaService,
    GrupoPermissoesService,
    PerfisService,
    GeograficoService,
    UsuariosApiService,
    EditarManualmenteService,
    NotificacaoService,
    VeiculoService,
    PerfisService,
    UsuarioServicoService,
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
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CrmModule {
  constructor(private injector: Injector) {
    appInjector = this.injector;
  }
}

export let appInjector: Injector;
