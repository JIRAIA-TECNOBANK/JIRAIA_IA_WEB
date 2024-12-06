import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarcasModelosRoutingModule } from './marcas-modelos.routing.module';
import { EditarModelosComponent } from './pages/editar-modelos/editar-modelos.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { TabelaModelosComponent } from './pages/editar-modelos/components/tabela-modelos/tabela-modelos.component';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { DialogAdicionarModeloComponent } from './pages/editar-modelos/components/dialog-adicionar-modelo/dialog-adicionar-modelo.component';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

@NgModule({
  declarations: [
    EditarModelosComponent,
    TabelaModelosComponent,
    DialogAdicionarModeloComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MarcasModelosRoutingModule,
    MatButtonModule,
    MatPaginatorModule,
    MatCardModule,
    MatSortModule,
    MatTableModule,
    MatMenuModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    FlexLayoutModule,
    MatSelectModule
  ]
})
export class MarcasModelosModule { }
