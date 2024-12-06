import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatLegacyCardModule } from '@angular/material/legacy-card';
import { eGarantiaRoutingModule } from './eGarantia-routing.module';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatMenuModule } from '@angular/material/menu';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { NgxMaskModule } from 'ngx-mask';
import { DetransComponent } from './pages/detrans/detrans-list/detrans-list.component';
import { DetransRegisterComponent } from './pages/detrans/detrans-register/detrans-register.component';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { AplicacoesComponent } from './pages/aplicacoes/aplicacoes-list/aplicacoes-list.component';
import { AplicacoesRegisterComponent } from './pages/aplicacoes/aplicacoes-register/aplicacoes-register.component';
import { ProtocolosComponent } from './pages/protocolos/protocolos-list/protocolos-list.component';
import { ProtocolosRegisterComponent } from './pages/protocolos/protocolos-register/protocolos-register.component';
@NgModule({
  declarations: [
    DetransComponent,
    DetransRegisterComponent,
    AplicacoesComponent,
    AplicacoesRegisterComponent,
    ProtocolosComponent,
    ProtocolosRegisterComponent
  ],
  imports: [
    MatSlideToggleModule,
    MatInputModule,
    MatFormFieldModule,
    CommonModule,
    SharedModule,
    eGarantiaRoutingModule,
    MatLegacyCardModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatPaginatorModule,
    MatTableModule,
    MatMenuModule,
    MatGridListModule,
    MatIconModule,
    NgxMaskModule.forChild(),
  ],
  providers: [
    AppSettings,
    NotifierService
  ]
})
export class eGarantiaModule { }
