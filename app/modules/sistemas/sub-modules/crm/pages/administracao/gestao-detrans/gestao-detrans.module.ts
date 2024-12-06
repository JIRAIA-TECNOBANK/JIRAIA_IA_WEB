import { CommonModule } from "@angular/common";
import { Injector, NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MAT_DATE_LOCALE, MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatLegacyCardModule as MatCardModule } from "@angular/material/legacy-card";
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { MatLegacyMenuModule as MatMenuModule } from "@angular/material/legacy-menu";
import { MatLegacyPaginatorModule as MatPaginatorModule } from "@angular/material/legacy-paginator";
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
import { MatLegacySlideToggleModule as MatSlideToggleModule } from "@angular/material/legacy-slide-toggle";
import { MatLegacyTableModule as MatTableModule } from "@angular/material/legacy-table";
import { MatLegacyTabsModule as MatTabsModule } from "@angular/material/legacy-tabs";
import { MatLegacyTooltipModule as MatTooltipModule } from "@angular/material/legacy-tooltip";
import { MatSortModule } from "@angular/material/sort";
import { MatStepperModule } from '@angular/material/stepper';
import { CurrencyMaskModule } from "ng2-currency-mask";
import { NgxMaskModule } from "ngx-mask";
import { NgxMaterialTimepickerModule } from "ngx-material-timepicker";
import { AppSettings } from "src/app/configs/app-settings.config";
import { SharedModule } from "src/app/shared/shared.module";
import { FaturamentoModule } from "../../../../faturamento/faturamento.module";
import { EmpresasModule } from "../../empresas/empresas.module";
import { GestaoDetransService } from "../_core/services/gestao-detrans.service";
import { CriarDetranComponent } from "./components/criar-detran/criar-detran.component";
import { DialogInativarDetranComponent } from "./components/dialog-inativar-detran/dialog-inativar-detran.component";
import { StepperParametrizarDetranComponent } from "./components/stepper-parametrizar-detran/stepper-parametrizar-detran.component";
import { TableGestaoDetransComponent } from "./components/table-gestao-detrans/table-gestao-detrans.component";
import { GestaoDetransComponent } from "./gestao-detrans.component";
import { GestaoDetransRoutingModule } from "./gestao-detrans.routing.module";

@NgModule({
    declarations: [
        GestaoDetransComponent,
        TableGestaoDetransComponent,
        CriarDetranComponent,
        DialogInativarDetranComponent,
        StepperParametrizarDetranComponent,
    ],
    imports: [
        GestaoDetransRoutingModule,
        CommonModule,
        FlexLayoutModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatGridListModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatSelectModule,
        MatTooltipModule,
        MatTableModule,
        MatSortModule,
        MatTabsModule,
        MatDatepickerModule,
        CurrencyMaskModule,
        MatNativeDateModule,
        NgxMaterialTimepickerModule,
        MatSlideToggleModule,
        MatIconModule,
        MatStepperModule,
        EmpresasModule,
        MatCheckboxModule,
        MatExpansionModule,
        MatButtonToggleModule,
        FaturamentoModule,
        NgxMaskModule.forChild(),
    ],
    exports: [
    ],
    providers: [
        GestaoDetransService,
        AppSettings,
        {
            provide: MAT_DATE_LOCALE,
            useValue: 'pt-BR',
        },
    ],
})
export class GestaoDetransModule {
    constructor(private injector: Injector) {
        appInjector = this.injector;
    }
}

export let appInjector: Injector;