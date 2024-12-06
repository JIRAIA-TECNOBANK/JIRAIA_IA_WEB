import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EContratoRoutingModule } from './e-contrato-routing.module';
import { ConfiguracoesImagensComponent } from './configuracoes-imagens/configuracoes-imagens.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { NgxMaskModule } from 'ngx-mask';
import { RegistrarDetranImagemComponent } from './registrar-detran-imagem/registrar-detran-imagem.component';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { GestaoBannersComponent } from './gestao-banners/gestao-banners.component';
import { CriarBannerComponent } from './gestao-banners/components/criar-banner/criar-banner.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { FORMATO_DATA } from 'src/app/modules/sistemas/core/models/common/formato-date-picker.model';
import { MarcasModelosComponent } from './marcas-modelos/marcas-modelos.component';
import { TabelaMarcasComponent } from './marcas-modelos/components/tabela-marcas/tabela-marcas.component';
import { TabelaEspeciesComponent } from './marcas-modelos/components/tabela-especies/tabela-especies.component';
import { TabelaCoresComponent } from './marcas-modelos/components/tabela-cores/tabela-cores.component';
import { DialogAdicionarCorComponent } from './marcas-modelos/components/dialog-adicionar-cor/dialog-adicionar-cor.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { DialogAdicionarEspecieComponent } from './marcas-modelos/components/dialog-adicionar-especie/dialog-adicionar-especie.component';
import { DialogAdicionarMarcaComponent } from './marcas-modelos/components/dialog-adicionar-marca/dialog-adicionar-marca.component';

@NgModule({
  declarations: [
    ConfiguracoesImagensComponent,
    RegistrarDetranImagemComponent,
    GestaoBannersComponent,
    CriarBannerComponent,
    MarcasModelosComponent,
    TabelaMarcasComponent,
    TabelaEspeciesComponent,
    TabelaCoresComponent,
    DialogAdicionarCorComponent,
    DialogAdicionarEspecieComponent,
    DialogAdicionarMarcaComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    EContratoRoutingModule,
    FlexLayoutModule,
    FormsModule,
    MatCardModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatSlideToggleModule,
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
    MatPaginatorModule,
    MatDialogModule,
    MatButtonToggleModule,
    NgxMaskModule.forChild()
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: FORMATO_DATA },
  ]
})
export class EContratoModule { }
