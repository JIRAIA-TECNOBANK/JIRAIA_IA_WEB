import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ConfiguracoesModule } from './configuracoes/configuracoes.module';
import { SistemasModule } from './sistemas/sistemas.module';
import { RelatoriosModule } from './sistemas/sub-modules/crm/pages/relatorios/relatorios.module';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { FORMATO_DATA } from './sistemas/core/models/common/formato-date-picker.model';

@NgModule({
  imports: [
    CommonModule,
    SistemasModule,
    ConfiguracoesModule,
    RelatoriosModule,
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
export class ModulesModule { }
