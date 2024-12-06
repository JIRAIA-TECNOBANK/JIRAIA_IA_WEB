import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { EmpresasService } from 'src/app/modules/sistemas/sub-modules/crm/services/empresas.service';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FilterFieldReturn } from 'src/app/shared/core/models/grid-filter/filter-field-return.model';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { FiltroConciliacao } from '../../../../core/models/faturamento-conciliado/filtro-conciliacao.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-filtro-conciliacao',
  templateUrl: './filtro-conciliacao.component.html',
  styleUrls: ['./filtro-conciliacao.component.scss'],
})
export class FiltroConciliacaoComponent {
  utility = Utility;

  filtroConciliacao: FiltroConciliacao;
  ufControl: FormControl;

  fieldNomeEmpresa: FilterField = <FilterField>{
    id: 'empresaNome',
    titulo: 'Por empresa',
    tipo: TipoFilterField.Checkbox,
    options: [],
    searchInput: true,
    showTooltip: true,
  };

  fieldCodigoEmpresa: FilterField = <FilterField>{
    id: 'empresaCodigo',
    titulo: 'Por código',
    tipo: TipoFilterField.Text,
    validators: Validators.pattern('^[0-9]*$'),
  };

  fieldUf: FilterField = <FilterField>{
    id: 'Uf',
    titulo: 'Por UF',
    tipo: TipoFilterField.Checkbox,
    options: [],
    selectAllOptions: 'Todas',
  };

  fieldDataReferencia: FilterField = <FilterField>{
    id: 'dataReferencia',
    titulo: 'Por mês/ano',
    tipo: TipoFilterField.Datepicker,
  };

  fieldStatus: FilterField = <FilterField>{
    id: 'Status',
    titulo: 'Por status',
    tipo: TipoFilterField.Checkbox,
    options: [],
    selectAllOptions: 'Todos',
    orderOptions: false,
  };

  filter: GridFilter = <GridFilter>{
    id: '',
    customFields: true,
    maxNumberFields: 5,
    fields: [
      this.fieldNomeEmpresa,
      this.fieldCodigoEmpresa,
      this.fieldUf,
      this.fieldDataReferencia,
      this.fieldStatus,
    ],
  };

  empresaNomeControl: FormControl;
  empresaNomeSearchControl: FormControl;
  codigoEmpresaControl: FormControl;
  dataReferenciaControl: FormControl;
  statusControl: FormControl;

  empresaOptions: FieldOption[] = [];

  refreshGrid: boolean = false;
  showRedefinirBtn: boolean = false;

  pipe = new DatePipe('pt-BR');

  @Output('filtro') filtro: EventEmitter<FiltroConciliacao> =
    new EventEmitter<FiltroConciliacao>();

  @Input('ufOptions') set setUfOptions(value) {
    this.fieldUf.options = value;
  }

  @Input('empresaOptions') set setEmpresaOptions(value) {
    this.empresaOptions = value;
    this.fieldNomeEmpresa.options = value;
  }

  @Input('statusOptions') set setStatusOptions(value) {
    this.fieldStatus.options = value;
  }

  @Input('id') set setId(value) {
    this.filter.id = value;
  }

  constructor(private empresaService: EmpresasService) {}

  search(event) {
    let dataReferencia = this.pipe.transform(
      event.get('dataReferencia'),
      'yyyy-MM-dd'
    );

    this.filtroConciliacao = <FiltroConciliacao>{
      EmpresaId: event.get(this.fieldNomeEmpresa.id),
      Id: event.get(this.fieldCodigoEmpresa.id),
      Uf: event.get(this.fieldUf.id),
      DataReferencia: dataReferencia,
      ListaStatus: event.get(this.fieldStatus.id),
    };

    this.filtro.emit(this.filtroConciliacao);

    this.showRedefinirBtn = true;
  }

  redefinirFiltros() {
    this.filtroConciliacao = null;
    this.refreshGrid = !this.refreshGrid;
    this.showRedefinirBtn = false;
    this.filtro.emit(this.filtroConciliacao);
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
  }

  searchFilterEmpresas(event: FieldOption) {
    let filtro = Utility.checkNumbersOnly(event.value);
    filtro = filtro === '0' ? (filtro = '') : filtro;
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
