import { CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JuridicoRoutingModule } from './juridico-routing.module';
import { MonitorRegulatorioComponent } from './pages/monitor-regulatorio/monitor-regulatorio.component';
import { MapaJuridicoComponent } from './pages/monitor-regulatorio/components/mapa-juridico/mapa-juridico.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ObservacoesComponent } from './pages/monitor-regulatorio/components/observacoes/observacoes.component';
import { ListaRegulamentosComponent } from './pages/monitor-regulatorio/components/lista-regulamentos/lista-regulamentos.component';
import { BlocoVazioJuridicoComponent } from './pages/monitor-regulatorio/components/bloco-vazio/bloco-vazio.component';
import { ModeloRegulamentoComponent } from './pages/monitor-regulatorio/components/modelo-regulamento/modelo-regulamento.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NormativosComponent } from './pages/normativos/normativos.component';
import { MatLegacyCardModule } from '@angular/material/legacy-card';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTooltipModule as MatTooltipModule } from "@angular/material/legacy-tooltip";
import { TableNormativosComponent } from './pages/normativos/components/table-normativos/table-normativos.component';
import { FiltroNormativosComponent } from './pages/normativos/components/filtro-normativos/filtro-normativos.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CriarNormativoComponent } from './pages/criar-normativo/criar-normativo.component';
import { NormativosService } from './services/normativos.service';
import { RegistrosService } from './services/registros.service';
import { DominioService } from './services/dominio.service';
import { GarantiasService } from './services/garantias.service';
import { DialogConfirmationComponent } from './pages/normativos/components/dialog-confirmation/dialog-confirmation.component';
import { RegistrosComponent } from './pages/registros/registros.component';
import { TableRegistrosComponent } from './pages/registros/components/registros/table-registros/table-registros.component';
import { FiltroRegistrosComponent } from './pages/registros/components/registros/filtro-registros/filtro-registros.component';
import { MatIconModule } from '@angular/material/icon';
import { CriarRegistroComponent } from './pages/criar-registro/criar-registro.component';
import { TableGarantiasComponent } from './pages/registros/components/garantias/table-garantias/table-garantias.component';
import { FiltroGarantiasComponent } from './pages/registros/components/garantias/filtro-garantias/filtro-garantias.component';
import { CriarGarantiaComponent } from './pages/criar-garantia/criar-garantia.component';
import { CriarInstituicaoComponent } from './pages/criar-instituicao/criar-instituicao.component';
import { FiltroInstituicaoComponent } from './pages/registros/components/instituicao/filtro-instituicao/filtro-instituicao.component';
import { TableInstituicaoComponent } from './pages/registros/components/instituicao/table-instituicao/table-instituicao.component';
import { DocumentosCredenciamentoComponent } from './pages/monitor-regulatorio/components/documentos-credenciamento/documentos-credenciamento';
import { FiltroMonitorComponent } from './pages/monitor-regulatorio/components/filtro-monitor/filtro-monitor.component';
import { SelecaoRegulamentosComponent } from './pages/monitor-regulatorio/components/selecao-regulamentos/selecao-regulamentos.component';
import { CriarContatosComponent } from './pages/criar-contatos/criar-contatos.component';
import { ContatosComponent } from './pages/contatos/contatos.component';
import { TableContatosComponent } from './pages/contatos/components/table-contatos/table-contatos.component';
import { FiltroContatosComponent } from './pages/contatos/components/filtro-contatos/filtro-contatos.component';
import { ChatComponent } from './pages/chat/chat.component';
import { MonitorNormativoComponent } from './pages/monitor-normativo/monitor-normativo.component';
import { TableArquivoCompiladoComponent } from './pages/monitor-normativo/components/table-arquivo-compilado/table-arquivo-compilado.component';
import { ResumirDocumentoDialogComponent } from './pages/chat/resumir-documento-dialog/resumir-documento-dialog.component';
import { EncontrarDocumentoDialogComponent } from './pages/chat/encontrar-documento-dialog/encontrar-documento-dialog.component';
import { TableArquivoNormativoRejeitadoComponent } from './pages/monitor-normativo/components/table-arquivo-normativo-rejeitado/table-arquivo-normativo-rejeitado.component';
import { TableArquivoNormativoAprovadoComponent } from './pages/monitor-normativo/components/table-arquivo-normativo-aprovado/table-arquivo-normativo-aprovado.component';
import { TableArquivoNormativoAprovacaoComponent } from './pages/monitor-normativo/components/table-arquivo-normativo-aprovacao/table-arquivo-normativo-aprovacao.component';
import { EnviarArquivoCompiladoDialogComponent } from './pages/monitor-normativo/components/enviar-arquivo-compilado-dialog/enviar-arquivo-compilado-dialog.component';
import { AprovarArquivoNormativoDialogComponent } from './pages/monitor-normativo/components/aprovar-arquivo-normativo-dialog/aprovar-arquivo-normativo-dialog.component';

@NgModule({
  declarations: [
    MonitorRegulatorioComponent,
    MapaJuridicoComponent,
    ObservacoesComponent,
    BlocoVazioJuridicoComponent,
    ModeloRegulamentoComponent,
    ListaRegulamentosComponent,
    NormativosComponent,
    TableNormativosComponent,
    FiltroNormativosComponent,
    CriarNormativoComponent,
    DialogConfirmationComponent,
    RegistrosComponent,
    TableRegistrosComponent,
    FiltroRegistrosComponent,
    CriarRegistroComponent,
    TableGarantiasComponent,
    FiltroGarantiasComponent,
    CriarGarantiaComponent,
    CriarInstituicaoComponent,
    FiltroInstituicaoComponent,
    TableInstituicaoComponent,
    DocumentosCredenciamentoComponent,
    FiltroMonitorComponent,
    SelecaoRegulamentosComponent,
    CriarContatosComponent,
    ContatosComponent,
    TableContatosComponent,
    FiltroContatosComponent,
    ChatComponent,
    MonitorNormativoComponent,
    TableArquivoCompiladoComponent,
    ResumirDocumentoDialogComponent,
    EncontrarDocumentoDialogComponent,
    TableArquivoNormativoRejeitadoComponent,
    TableArquivoNormativoAprovadoComponent,
    TableArquivoNormativoAprovacaoComponent,
    EnviarArquivoCompiladoDialogComponent,
    AprovarArquivoNormativoDialogComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatButtonToggleModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatDatepickerModule,
    JuridicoRoutingModule,
    MatIconModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    //LEGACY
    MatLegacyCardModule,
    MatPaginatorModule,
    MatTabsModule,
    MatButtonModule,
    MatRadioModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
  ],
  providers: [
    NormativosService,
    RegistrosService,
    DominioService,
    GarantiasService,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class JuridicoModule {
  constructor(private injector: Injector) {
    appInjector = this.injector;
  }
}
export let appInjector: Injector;