import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { EmpresasService } from 'src/app/modules/sistemas/sub-modules/crm/services/empresas.service';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FilterFieldReturn } from 'src/app/shared/core/models/grid-filter/filter-field-return.model';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { FiltroFaturado } from '../../../../core/models/faturamento-conciliado/filtro-faturado.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-filtro-faturado',
  templateUrl: './filtro-faturado.component.html',
  styleUrls: ['./filtro-faturado.component.scss']
})
export class FiltroFaturadoComponent {

  utility = Utility;

  filtroFaturado: FiltroFaturado;

  fieldNomeEmpresa: FilterField = <FilterField>{
    id: 'empresaNome',
    titulo: 'Por empresa',
    tipo: TipoFilterField.Checkbox,
    options: [],
    searchInput: true,
    showTooltip: true
  };

  fieldCodigoEmpresa: FilterField = <FilterField>{
    id: 'empresaCodigo',
    titulo: 'Por código',
    tipo: TipoFilterField.Text,
    validators: Validators.pattern('^[0-9]*$'),
  };

  fieldUf: FilterField = <FilterField>{
    id: 'uf',
    titulo: 'Por UF',
    tipo: TipoFilterField.Checkbox,
    options: [],
    selectAllOptions: 'Todas',
  };

  fieldDataReferencia: FilterField = <FilterField>{
    id: 'dataReferencia',
    titulo: 'Por mês/ano',
    tipo: TipoFilterField.Datepicker
  };

  fieldStatus: FilterField = <FilterField>{
    id: 'status',
    titulo: 'Por status',
    tipo: TipoFilterField.Checkbox,
    options: [
      <FieldOption>{ label: 'Conciliado', value: 1 },
      <FieldOption>{ label: 'Não conciliado', value: 2 }
    ],
    selectAllOptions: 'Todos'
  };

  fieldStatusNF: FilterField = <FilterField>{
    id: 'statusNF',
    titulo: 'Por nota fiscal',
    tipo: TipoFilterField.Checkbox,
    options: [
      <FieldOption>{ label: 'Aguardando emissão', value: 0 },
      <FieldOption>{ label: 'Erro na emissão', value: 1 },
      <FieldOption>{ label: 'Emitida', value: 2 },
      <FieldOption>{ label: 'Paga', value: 3 }
    ],
    selectAllOptions: 'Todos',
    orderOptions: false
  };

  fieldStatusND: FilterField = <FilterField>{
    id: 'statusND',
    titulo: 'Por nota de débito',
    tipo: TipoFilterField.Checkbox,
    options: [
      <FieldOption>{ label: 'Aguardando emissão', value: 0 },
      <FieldOption>{ label: 'Erro na emissão', value: 1 },
      <FieldOption>{ label: 'Emitida', value: 2 },
      <FieldOption>{ label: 'Paga', value: 3 }
    ],
    selectAllOptions: 'Todos',
    orderOptions: false
  };

  filter: GridFilter = <GridFilter>{
    id: 'faturado',
    customFields: true,
    maxNumberFields: 5,
    fields: [
      this.fieldNomeEmpresa,
      this.fieldCodigoEmpresa,
      this.fieldUf,
      this.fieldDataReferencia,
      this.fieldStatus,
      this.fieldStatusNF,
      this.fieldStatusND
    ],
  };

  empresaNomeControl: FormControl;
  empresaNomeSearchControl: FormControl;
  codigoEmpresaControl: FormControl;
  dataReferenciaControl: FormControl;
  ufControl: FormControl;
  statusControl: FormControl;
  statusNFControl: FormControl;
  statusNDControl: FormControl;

  empresaOptions: FieldOption[] = [];

  refreshGrid: boolean = false;
  showRedefinirBtn: boolean = false;

  pipe = new DatePipe('pt-BR');

  @Output('filtro') filtro: EventEmitter<FiltroFaturado> = new EventEmitter<FiltroFaturado>();

  @Input('ufOptions') set setUfOptions(value) {
    this.fieldUf.options = value;
  }

  @Input('empresaOptions') set setEmpresaOptions(value) {
    this.empresaOptions = value;
    this.fieldNomeEmpresa.options = value;
  }

  constructor(private empresaService: EmpresasService) {}

  

  search(event) {
    let dataReferencia = this.pipe.transform(event.get('dataReferencia'), 'yyyy-MM-dd');

    this.filtroFaturado = <FiltroFaturado>{
      EmpresaId: event.get(this.fieldNomeEmpresa.id),
      Id: event.get(this.fieldCodigoEmpresa.id),
      Uf: event.get(this.fieldUf.id),
      DataReferencia: dataReferencia,
      ListaStatus: event.get(this.fieldStatus.id),
      ListaNotaFiscal: event.get(this.fieldStatusNF.id),
      ListaNotaDebito: event.get(this.fieldStatusND.id)
    };

    this.filtro.emit(this.filtroFaturado);

    this.showRedefinirBtn = true;
  }

  redefinirFiltros() {
    this.filtroFaturado = null;
    this.refreshGrid = !this.refreshGrid;
    this.showRedefinirBtn = false;
    this.filtro.emit(this.filtroFaturado);
  }

  setCustomControls(event: Map<string, AbstractControl>) {
    this.empresaNomeControl = event.get(
      this.fieldNomeEmpresa.id
    ) as FormControl;
    this.empresaNomeSearchControl = event.get(
      this.fieldNomeEmpresa.id + '_search'
    ) as FormControl;
    this.codigoEmpresaControl = event.get(
      this.fieldCodigoEmpresa.id
    ) as FormControl;
    this.ufControl = event.get(this.fieldUf.id) as FormControl;
    this.dataReferenciaControl = event.get(
      this.fieldDataReferencia.id
    ) as FormControl;
    this.statusControl = event.get(this.fieldStatus.id) as FormControl;
    this.statusNFControl = event.get(this.fieldStatusNF.id) as FormControl;
    this.statusNDControl = event.get(this.fieldStatusND.id) as FormControl;
  }

  searchFilterEmpresas(event: FieldOption) {
    let filtro = Utility.checkNumbersOnly(event.value);
    filtro = filtro === '0' ? filtro = '' : filtro;
    this.carregarEmpresas(filtro);
  }

  carregarEmpresas(filtroEmpresa = '') {
    this.fieldNomeEmpresa.options = [];
    filtroEmpresa
      ? this.carregarEmpresasComFiltro(filtroEmpresa)
      : this.fieldNomeEmpresa.options = this.empresaOptions;
  }

  redefinir(control: FormControl) {
    control.reset();

    this.dataReferenciaControl.reset();
  }

  selectAll(fieldReturn: FilterFieldReturn) {
    let control;
    let options;

    switch (fieldReturn.field.id) {
      case this.fieldUf.id:
        control = this.ufControl;
        options = this.fieldUf.options;
        break;

      case this.fieldStatus.id:
        control = this.statusControl;
        options = this.fieldStatus.options;
        break;

      case this.fieldStatusNF.id:
        control = this.statusNFControl;
        options = this.fieldStatusNF.options;
        break;

      case this.fieldStatusND.id:
        control = this.statusNDControl;
        options = this.fieldStatusND.options;
        break;
    }

    this.selectAllOptions(control, fieldReturn.selected, options);
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

  private carregarEmpresasComFiltro(filtroEmpresa) {
    this.empresaService.obterEmpresasFiltro(0, 10, filtroEmpresa).subscribe(
      (response) => {
        if (response.isSuccessful) {
          let options = [];
          response.empresas.forEach((empresa) => {
            options.push(<FieldOption>{
              value: empresa.id,
              label: Utility.getClienteNomeCnpj(empresa),
            });
          });

          this.fieldNomeEmpresa.options = options;
        }

        response.errors.forEach((error) => {
          console.info(`${error.code}-${error.message}`);
        });
      },
      (error) => console.info(error)
    );
  }

  private carregarEmpresasSemFiltro() {
    this.empresaService.obterEmpresas(0, 10).subscribe(
      (response) => {
        if (response.isSuccessful) {
          let options = [];
          response.empresas.forEach((empresa) => {
            options.push(<FieldOption>{
              value: empresa.id,
              label: Utility.getClienteNomeCnpj(empresa),
            });
          });

          this.fieldNomeEmpresa.options = options;
        }

        response.errors.forEach((error) => {
          console.info(`${error.code}-${error.message}`);
        });
      },
      (error) => console.info(error)
    );
  }
}
