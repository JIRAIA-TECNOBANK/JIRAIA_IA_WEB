import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { PortalDominioService } from 'src/app/modules/sistemas/sub-modules/admin/services/_portal/portal-dominio.service';
import { DominiosResponse } from 'src/app/modules/sistemas/sub-modules/crm/core/responses/dominios/dominios.response';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FilterCustomField } from 'src/app/shared/core/models/grid-filter/filter-custom-field.model';
import { FilterFieldReturn } from 'src/app/shared/core/models/grid-filter/filter-field-return.model';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { FiltroNormativos } from '../../../../core/model/normativos.model';
import { DominioService } from '../../../../services/dominio.service';
import { NormativosService } from '../../../../services/normativos.service';

@Component({
  selector: 'app-filtro-normativos',
  templateUrl: './filtro-normativos.component.html',
  styleUrls: ['./filtro-normativos.component.scss', './../../../../../../../../shared/components/filter-field/filter-field.component.scss']
})
export class FiltroNormativosComponent implements OnInit {
  utility = Utility;

  fieldNomePortaria: FilterField = <FilterField>{
    id: 'nomePortaria',
    titulo: 'Por nome da portaria',
    tipo: TipoFilterField.Text
  };

  fieldNomeArquivo: FilterField = <FilterField>{
    id: 'nomeArquivo',
    titulo: 'Por nome de arquivo',
    tipo: TipoFilterField.Text,
  };

  fieldUf: FilterField = <FilterField>{
    id: 'Uf',
    titulo: 'Por UF',
    tipo: TipoFilterField.Checkbox,
    options: [],
    selectAllOptions: 'Todas',
  };

  fieldStatus: FilterField = <FilterField>{
    id: 'status',
    titulo: 'Por Status',
    tipo: TipoFilterField.Checkbox,
    options: [
      { value: 1, label: 'Ativo' },
      { value: 2, label: 'Arquivado' }
    ],
    selectAllOptions: 'Todas',
  };

  fieldTipoRegistro: FilterField = <FilterField>{
    id: 'tipoRegistro',
    titulo: 'Por tipo de registro',
    tipo: TipoFilterField.Checkbox,
    options: [
      { value: 1, label: 'Registro de contrato' },
      { value: 2, label: 'Registro de garantia' },
      { value: 3, label: 'Registro de instituição financeira' }
    ],
    selectAllOptions: 'Todas',
  };

  fieldTipo: FilterField = <FilterField>{
    id: 'tipo',
    titulo: 'Por Tipo',
    tipo: TipoFilterField.Checkbox,
    options: [],
    selectAllOptions: 'Todas',
  };

  fieldNacional: FilterField = <FilterField>{
    id: 'nacional',
    titulo: 'Por visão',
    tipo: TipoFilterField.Checkbox,
    options: [
      { value: true, label: 'Visão Nacional' },
      { value: false, label: 'Visão Estadual' },
    ],
    selectAllOptions: 'Todas',
  };

  fieldPeriodoVigencia: FilterField = <FilterField>{
    id: 'periodoVigencia',
    titulo: 'Por período de vigência',
    tipo: TipoFilterField.Period,
    options: [],
    customFields: [
      <FilterCustomField>{ id: 'periodoVigencia_De' },
      <FilterCustomField>{ id: 'periodoVigencia_Ate' },
    ],
  };

  filter: GridFilter = <GridFilter>{
    id: 'normativos',
    customFields: false,
    fields: [
      this.fieldNomePortaria,
      this.fieldNomeArquivo,
      this.fieldUf,
      this.fieldStatus,
      this.fieldTipoRegistro,
      this.fieldTipo,
      this.fieldNacional,
      this.fieldPeriodoVigencia,
    ],
  };

  filtroNormativos: FiltroNormativos;

  refreshGrid: boolean = false;
  showRedefinirBtn: boolean = false;
  requiredFieldsError: boolean = false;
  erroDataFinal: boolean = false;

  pipe = new DatePipe('pt-BR');

  @Output('filtro') filtro: EventEmitter<FiltroNormativos> = new EventEmitter<FiltroNormativos>();

  constructor(
    private dominioService: DominioService,
    private normativoService: NormativosService,
    private portalDominioService: PortalDominioService
  ) { }

  ngOnInit() {
    this.carregarUfs();
    this.carregarPeriodo();
    this.carregarTipoNomativo();
  }

  search(event) {
    let nomePortaria = event.get(this.fieldNomePortaria.id);
    let nomeArquivo = event.get(this.fieldNomeArquivo.id);
    let uf = event.get(this.fieldUf.id);
    let dataInicioVigencia = event.get(this.fieldPeriodoVigencia.customFields[0].id);
    let dataFimVigencia = event.get(this.fieldPeriodoVigencia.customFields[1].id);
    let status = event.get(this.fieldStatus.id);
    let tipoRegistro = event.get(this.fieldTipoRegistro.id);
    let tipo = event.get(this.fieldTipo.id);
    let visaoNacional = event.get(this.fieldNacional.id);

    this.filtroNormativos = <FiltroNormativos>{
      nomePortaria: nomePortaria ? nomePortaria : '',
      nomeArquivo: '',
      uf: uf?.length > 0 ? uf : [],
      dataInicioVigencia: dataInicioVigencia ? dataInicioVigencia : '',
      dataFimVigencia: dataFimVigencia ? dataFimVigencia : '',
      status: status?.length > 0 ? status : [],
      tipoRegistro: tipoRegistro?.length > 0 ? tipoRegistro : [],
      tipo: tipo?.length > 0 ? tipo : [],
      visaoNacional: visaoNacional != null ? (visaoNacional.length > 1 ? '' : visaoNacional[0]) : ''
    };

    this.filtro.emit(this.filtroNormativos);
    this.showRedefinirBtn = true;
  }

  redefinirFiltros() {
    this.filtroNormativos = null;
    this.refreshGrid = !this.refreshGrid;
    this.showRedefinirBtn = false;
    this.filtro.emit(this.filtroNormativos);
  }

  redefinir(control: FormControl) {
    control.reset();
  }

  private carregarPeriodo() {
    this.portalDominioService.obterPorTipo('PERIODO').subscribe(
      (response: DominiosResponse) => {
        if (response.isSuccessful) {
          response.valorDominio.forEach((periodo) => {
            this.fieldPeriodoVigencia.options.push(<FieldOption>{
              value: periodo.palavraChave,
              label: periodo.valor,
            });
          });
        }

        response.errors.forEach((error) => {
          console.info(`${error.code}-${error.message}`);
        });
      },
      (error) => console.info(error)
    );
  }

  private carregarUfs() {
    this.dominioService.obterPorTipo('uf').subscribe((result) => {
      result.valorDominio.sort((a, b) => a.valor.localeCompare(b.valor)).forEach((uf) => {
        this.fieldUf.options.push(<FieldOption>{
          value: uf.valor,
          label: uf.valor,
        });
      });

    });
  }

  private carregarTipoNomativo() {
    this.normativoService.obterListaTipoNormativo().subscribe((result) => {
      result.tiposNormativo.forEach((tipo) => {
        this.fieldTipo.options.push(<FieldOption>{
          value: tipo.id,
          label: tipo.nome,
        });
      });
    });
  }

  private selectAllOptions(
    control: FormControl,
    selected: boolean,
    options: FieldOption[]
  ) {
    if (selected) {
      control.patchValue([...options.map((item) => item.value), 'selectAll']);
      return;
    }

    control.patchValue([]);
  }
}
