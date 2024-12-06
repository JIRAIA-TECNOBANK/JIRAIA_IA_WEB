import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Injector, LOCALE_ID, NgModule } from '@angular/core';

import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { RouterModule } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CURRENCY_MASK_CONFIG, CurrencyMaskConfig } from 'ng2-currency-mask';
import { SharedModule } from 'src/app/shared/shared.module';
import { DialogCommonComponent } from '../../shared/components/dialog-common/dialog-common.component';
import { FORMATO_DATA } from './core/models/common/formato-date-picker.model';
import { AcessoNegadoComponent } from './pages/acesso-negado/acesso-negado.component';
import { AtalhosComponent } from './pages/dashboard/components/atalhos/atalhos.component';
import { ConexaoDetransComponent } from './pages/dashboard/components/conexao-detrans/conexao-detrans.component';
import { DialogAcessoNegadoComponent } from './pages/dashboard/components/dialog-acesso-negado/dialog-acesso-negado.component';
import { FiltroGraficosComponent } from './pages/dashboard/components/filtro-graficos/filtro-graficos.component';
import { GraficoResumoComponent } from './pages/dashboard/components/grafico-resumo/grafico-resumo.component';
import { OperacoesRegistradasComponent } from './pages/dashboard/components/operacoes-registradas/operacoes-registradas.component';
import { RegistrosEstadoComponent } from './pages/dashboard/components/registros-estado/registros-estado.component';
import { RegistrosInconsistenciaComponent } from './pages/dashboard/components/registros-inconsistencia/registros-inconsistencia.component';
import { RegistrosOperacaoComponent } from './pages/dashboard/components/registros-operacao/registros-operacao.component';
import { RegistrosSucessoComponent } from './pages/dashboard/components/registros-sucesso/registros-sucesso.component';
import { ResumoBotoesComponent } from './pages/dashboard/components/resumo-botoes/resumo-botoes.component';
import { TopEmpresasComponent } from './pages/dashboard/components/top-empresas/top-empresas.component';
import { TopInconsistenciasComponent } from './pages/dashboard/components/top-inconsistencias/top-inconsistencias.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TrocarSenhaComponent } from './pages/trocar-senha/trocar-senha.component';
import { SistemasRoutingModule } from './sistemas-routing.module';
import { AdminModule } from './sub-modules/admin/admin.module';
import { AditivoService } from './sub-modules/admin/services/_portal/aditivo.service';
import { ContratoService } from './sub-modules/admin/services/_portal/contrato.service';
import { CrmModule } from './sub-modules/crm/crm.module';
import { FaturamentoModule } from './sub-modules/faturamento/faturamento.module';
import { JuridicoModule } from './sub-modules/juridico/juridico.module';
import { eGarantiaModule } from './sub-modules/eGarantia/eGarantia.module';

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
    DashboardComponent,
    DialogCommonComponent,
    AcessoNegadoComponent,
    TrocarSenhaComponent,
    AtalhosComponent,
    DialogAcessoNegadoComponent,
    ConexaoDetransComponent,
    FiltroGraficosComponent,
    OperacoesRegistradasComponent,
    RegistrosEstadoComponent,
    GraficoResumoComponent,
    ResumoBotoesComponent,
    RegistrosOperacaoComponent,
    RegistrosSucessoComponent,
    RegistrosInconsistenciaComponent,
    TopEmpresasComponent,
    TopInconsistenciasComponent
  ],
  imports: [
    eGarantiaModule,
    CommonModule,
    SistemasRoutingModule,
    SharedModule,
    AdminModule,
    CrmModule,
    FaturamentoModule,
    MatDialogModule,
    MatFormFieldModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    FlexLayoutModule,
    MatButtonModule,
    RouterModule,
    NgApexchartsModule,
    MatTooltipModule,
    MatMenuModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    JuridicoModule
  ],
  providers: [
    ContratoService,
    AditivoService,
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
    { provide: LOCALE_ID, useValue: 'pt' }
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
]
})
export class SistemasModule {
  constructor(private injector: Injector) {
    appInjector = this.injector;
  }
}
export let appInjector: Injector;
