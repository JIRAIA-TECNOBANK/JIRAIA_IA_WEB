import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyPaginatorIntl as MatPaginatorIntl, MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { NgxMaskModule } from 'ngx-mask';
import { SharedModule } from 'src/app/shared/shared.module';
import { CustomPaginatorIntl } from 'src/app/shared/services/custom-paginator.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { AcessosRoutingModule } from './acessos-routing.module';
import { CriarUsuarioComponent } from './usuarios/components/criar-usuario/criar-usuario.component';
import { TableUsuariosComponent } from './usuarios/components/table-usuarios/table-usuarios.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { CriarAreasComponent } from './areas/components/criar-areas/criar-areas.component';
import { CriarPerfilComponent } from './perfis/components/criar-perfil/criar-perfil.component';
import { AreasComponent } from './areas/areas.component';
import { PerfisComponent } from './perfis/perfis.component';

@NgModule({
  declarations: [
    UsuariosComponent,
    TableUsuariosComponent,
    CriarUsuarioComponent,
    AreasComponent,
    CriarAreasComponent,
    PerfisComponent,
    CriarPerfilComponent
  ],
  imports: [
    CommonModule,
    AcessosRoutingModule,
    FlexLayoutModule,
    SharedModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
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
    MatExpansionModule,
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
//   entryComponents: [DialogListarEnderecosComponent],
})
export class AcessosModule {}
