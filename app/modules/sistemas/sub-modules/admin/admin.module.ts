import { CommonModule } from "@angular/common";
import { Injector, NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatLegacyCardModule as MatCardModule } from "@angular/material/legacy-card";
import { MatNativeDateModule, MAT_DATE_LOCALE } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import {MatExpansionModule} from '@angular/material/expansion';

import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { MatLegacyMenuModule as MatMenuModule } from "@angular/material/legacy-menu";
import { MatLegacyPaginatorModule as MatPaginatorModule } from "@angular/material/legacy-paginator";
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
import { MatLegacyTableModule as MatTableModule } from "@angular/material/legacy-table";
import { NgxMaskModule } from "ngx-mask";

import { AppSettings } from "src/app/configs/app-settings.config";
import { SharedModule } from "src/app/shared/shared.module";
import { AdminRoutingModule } from "./admin-routing.module";
import { UsuariosService } from "./services/usuarios.service";
import { HomeAdminComponent } from './pages/home-admin/home-admin.component';
import { AreasService } from "../crm/services/areas.service";
import { TransacaoService } from "./services/_portal/transacao.service";
import { VeiculoService } from "./services/_portal/veiculo.service";
import { PortalDominioService } from "./services/_portal/portal-dominio.service";
import { DominioService } from "./services/dominio.service";
import { NotificacaoService } from "../crm/services/notificacao.service";
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from "@angular/material/legacy-autocomplete";
import { MatLegacyTooltipModule as MatTooltipModule } from "@angular/material/legacy-tooltip";
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";
import { MatLegacyRadioModule as MatRadioModule } from "@angular/material/legacy-radio";
import { MatSortModule } from "@angular/material/sort";
import { MatLegacyTabsModule as MatTabsModule } from "@angular/material/legacy-tabs";
import { PerfisService } from "./services/perfis.service";

import { GrupoPermissaoService } from "./services/grupo-permissao.service";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
import { PortalGeograficoService } from "./services/_portal/portal-geografico.service";
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG, CurrencyMaskModule } from "ng2-currency-mask";
import { EditarManualmenteService } from "../crm/services/editar-manualmente.service";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { ConfirmarRegistrosComponent } from '../crm/pages/operacional/confirmar-registros/confirmar-registros.component';
import { MatLegacyChipsModule as MatChipsModule } from "@angular/material/legacy-chips";
import { AcessosModule } from "./pages/acessos/acessos.module";

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
    HomeAdminComponent,
    ConfirmarRegistrosComponent,
  ],
  imports: [
    AcessosModule,
    AdminRoutingModule,
    CommonModule,
    FlexLayoutModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTableModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatRadioModule,
    MatAutocompleteModule,
    MatSortModule,
    MatTabsModule,
    MatDialogModule,
    MatButtonToggleModule,
    MatChipsModule,
    CurrencyMaskModule,
    NgxMaskModule.forChild()
  ],
  providers: [
    AppSettings,
    UsuariosService,
    AreasService,
    TransacaoService,
    VeiculoService,
    PortalDominioService,
    PortalGeograficoService,
    DominioService,
    PerfisService,
    GrupoPermissaoService,
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'pt-br'
    },
    {
      provide: CURRENCY_MASK_CONFIG,
      useValue: CustomCurrencyMaskConfig
    }
  ]
})
export class AdminModule {

  constructor(private injector: Injector) {
    appInjector = this.injector;
  }
}

export let appInjector: Injector;
