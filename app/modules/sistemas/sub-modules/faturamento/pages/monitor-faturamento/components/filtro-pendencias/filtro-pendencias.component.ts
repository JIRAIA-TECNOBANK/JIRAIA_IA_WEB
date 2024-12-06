import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { EmpresasService } from 'src/app/modules/sistemas/sub-modules/crm/services/empresas.service';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FilterFieldReturn } from 'src/app/shared/core/models/grid-filter/filter-field-return.model';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { FiltroPendencias } from '../../../../core/models/faturamento-conciliado/filtro-pendencias.mode';
import { FaturamentoConciliadoService } from '../../../../services/faturamento-conciliado.service';

@Component({
  selector: 'app-filtro-pendencias',
  templateUrl: './filtro-pendencias.component.html',
  styleUrls: ['./filtro-pendencias.component.scss']
})
export class FiltroPendenciasComponent implements OnInit {

  utility = Utility;

  filtroPendencias: FiltroPendencias;
  ufControl: FormControl;

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
    id: 'Uf',
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
    id: 'statusRegistro',
    titulo: 'Por status registro',
    tipo: TipoFilterField.Checkbox,
    options: [],
    selectAllOptions: 'Todos',
  };

  filter: GridFilter = <GridFilter>{
    id: 'pendencias',
    customFields: true,
    maxNumberFields: 5,
    fields: [
      this.fieldNomeEmpresa,
      this.fieldCodigoEmpresa,
      this.fieldUf,
      this.fieldDataReferencia,
      this.fieldStatus
    ],
  };

  empresaNomeControl: FormControl;
  empresaNomeSearchControl: FormControl;
  codigoEmpresaControl: FormControl;
  dataReferenciaControl: FormControl;
  statusControl: FormControl;

  empresaOptions: FieldOption[] = [];
  statusOptions: FieldOption[] = [
    { value: 0, label: 'Não conciliado' },
    { value: 1, label: 'Reenviar' },
    { value: 2, label: 'Reprocessar' },
    { value: 3, label: 'Duplicado' },
    { value: 4, label: 'Contabilizado prejuízo' },
  ];

  refreshGrid: boolean = false;
  showRedefinirBtn: boolean = false;

  pipe = new DatePipe('pt-BR');

  @Output('filtro') filtro: EventEmitter<FiltroPendencias> = new EventEmitter<FiltroPendencias>();

  @Input('ufOptions') set setUfOptions(value) {
    this.fieldUf.options = value;
  }

  @Input('empresaOptions') set setEmpresaOptions(value) {
    this.empresaOptions = value;
    this.fieldNomeEmpresa.options = value;
  }

  constructor(private empresaService: EmpresasService, private faturamentoConciliadoService: FaturamentoConciliadoService) { }

  ngOnInit(): void {
    this.carregarStatusMotivo();
  }

  search(event) {
    let dataReferencia = this.pipe.transform(event.get('dataReferencia'), 'yyyy-MM-dd');

    this.filtroPendencias = <FiltroPendencias>{
      EmpresaId: event.get(this.fieldNomeEmpresa.id),
      Id: event.get(this.fieldCodigoEmpresa.id),
      Uf: event.get(this.fieldUf.id),
      DataReferencia: dataReferencia,
      StatusRegistro: event.get(this.fieldStatus.id)
    };

    this.filtro.emit(this.filtroPendencias);

    this.showRedefinirBtn = true;
  }

  redefinirFiltros() {
    this.filtroPendencias = null;
    this.refreshGrid = !this.refreshGrid;
    this.showRedefinirBtn = false;
    this.filtro.emit(this.filtroPendencias);
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
    this.statusControl = event.get(
      this.fieldStatus.id
    ) as FormControl;
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
  }

  selectAll(fieldReturn: FilterFieldReturn) {
    switch (fieldReturn.field.id) {
      case this.fieldUf.id:
        this.selectAllOptions(this.ufControl, fieldReturn.selected, this.fieldUf.options);
        return;

      case this.fieldStatus.id:
        this.selectAllOptions(this.statusControl, fieldReturn.selected, this.fieldStatus.options);
        return;
    }
  }

  private carregarStatusMotivo() {
    this.faturamentoConciliadoService.obterStatusMotivo().subscribe(response => {
      if (response.statusMotivo) {
        let options = [];
        response.statusMotivo.forEach((status) => {
          options.push(<FieldOption>{
            value: status.id,
            label: status.motivo,
          });
        });

        this.fieldStatus.options = options;
      }
    })
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
}
