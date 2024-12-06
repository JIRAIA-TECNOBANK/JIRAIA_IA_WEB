import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GestaoDudasRoutingModule } from './gestao-dudas-routing.module';
import { GestaoDudasComponent } from './pages/gestao-dudas/gestao-dudas.component';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { TableDudasComponent } from './components/table-dudas/table-dudas.component';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatSortModule } from '@angular/material/sort';
import { NgxMaskModule } from 'ngx-mask';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { FormParametrizarDudaComponent } from './pages/form-parametrizar-duda/form-parametrizar-duda.component';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { FormCompraManualComponent } from './pages/form-compra-manual/form-compra-manual.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TableDetalhamentoCompraComponent } from './components/table-detalhamento-compra/table-detalhamento-compra.component';
import { DetalhamentoCompraComponent } from './pages/detalhamento-compra/detalhamento-compra.component';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [
    GestaoDudasComponent,
    TableDudasComponent,
    FormParametrizarDudaComponent,
    FormCompraManualComponent,
    TableDetalhamentoCompraComponent,
    DetalhamentoCompraComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    GestaoDudasRoutingModule,
    FlexLayoutModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatFormFieldModule,
    MatMenuModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatListModule,
    MatGridListModule,
    MatRadioModule,
    MatDatepickerModule,
    MatTooltipModule,
    NgxMaskModule.forChild()

  ]
})
export class GestaoDudasModule { }
