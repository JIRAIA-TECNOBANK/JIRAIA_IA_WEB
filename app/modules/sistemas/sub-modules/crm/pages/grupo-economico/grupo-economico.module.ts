import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatLegacyCardModule as MatCardModule } from "@angular/material/legacy-card";
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { MatLegacyMenuModule as MatMenuModule } from "@angular/material/legacy-menu";
import { MatLegacyPaginatorModule as MatPaginatorModule, MatLegacyPaginatorIntl as MatPaginatorIntl } from "@angular/material/legacy-paginator";
import { MatLegacyRadioModule as MatRadioModule } from "@angular/material/legacy-radio";
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
import { MatLegacySlideToggleModule as MatSlideToggleModule } from "@angular/material/legacy-slide-toggle";
import { MatSortModule } from "@angular/material/sort";
import { MatLegacyTableModule as MatTableModule } from "@angular/material/legacy-table";
import { MatLegacyTabsModule as MatTabsModule } from "@angular/material/legacy-tabs";
import { MatLegacyTooltipModule as MatTooltipModule } from "@angular/material/legacy-tooltip";
import { NgxMaskModule } from "ngx-mask";
import { SharedModule } from "src/app/shared/shared.module";
import { CustomPaginatorIntl } from "../../../../../../shared/services/custom-paginator.service";
import { EmpresasModule } from "../empresas/empresas.module";
import { EmpresasDisponiveisComponent } from "./components/associacao-empresa/empresas-disponiveis/empresas-disponiveis.component";
import { EmpresasIncluidasComponent } from "./components/associacao-empresa/empresas-incluidas/empresas-incluidas.component";
import { CriarGrupoEconomicoComponent } from "./components/criar-grupo-economico/criar-grupo-economico.component";
import { GrupoEconomicoRoutingModule } from "./grupo-economico-routing.module";
import { AssociacaoEmpresaComponent } from "./pages/associacao-empresa/associacao-empresa.component";
import { TableUsuariosConvidadosComponent } from './components/convidados/table-usuarios-convidados/table-usuarios-convidados.component';
import { UsuariosConvidadosComponent } from "./components/convidados/usuarios-convidados/usuarios-convidados.component";
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from "@angular/material/legacy-autocomplete";
import { DialogAlertaExclusaoComponent } from './components/associacao-empresa/dialog-alerta-exclusao/dialog-alerta-exclusao.component';

@NgModule({
  declarations: [
    AssociacaoEmpresaComponent,
    EmpresasDisponiveisComponent,
    EmpresasIncluidasComponent,
    CriarGrupoEconomicoComponent,
    UsuariosConvidadosComponent,
    TableUsuariosConvidadosComponent,
    DialogAlertaExclusaoComponent
  ],
  imports: [
    CommonModule,
    GrupoEconomicoRoutingModule,
    EmpresasModule,
    FlexLayoutModule,
    SharedModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatRadioModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskModule.forChild(),
  ],
  exports: [
  ],
  providers: [
    {
      provide: MatPaginatorIntl,
      useClass: CustomPaginatorIntl,
    },
  ],
})
export class GrupoEconomicoModule { }
