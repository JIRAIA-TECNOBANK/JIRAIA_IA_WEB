
import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FilterFieldReturn } from 'src/app/shared/core/models/grid-filter/filter-field-return.model';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { FiltroGarantiasRegistros } from '../../../../../core/model/filtro-garantias-registros.model';
import { DominioService } from '../../../../../services/dominio.service';

@Component({
  selector: 'app-filtro-garantias',
  templateUrl: './filtro-garantias.component.html',
  styleUrls: ['./filtro-garantias.component.scss']
})

export class FiltroGarantiasComponent implements OnInit {
  utility = Utility;

  fieldUf: FilterField = <FilterField>{
    id: 'Uf',
    titulo: 'Por UF',
    tipo: TipoFilterField.Checkbox,
    options: [],
    selectAllOptions: 'Todas',
  };

  fieldTipoRegistro: FilterField = <FilterField>{
    id: 'tipoRegistro',
    titulo: 'Por tipo de registro',
    tipo: TipoFilterField.Text,
  };

  filter: GridFilter = <GridFilter>{
    id: 'garantias',
    customFields: true,
    fields: [
      this.fieldUf,
      this.fieldTipoRegistro,
    ],
  };

  ufControl: FormControl;
  tipoRegistroControl: FormControl;

  filtroGarantias: FiltroGarantiasRegistros;

  refreshGrid: boolean = false;
  showRedefinirBtn: boolean = false;
  requiredFieldsError: boolean = false;
  erroDataFinal: boolean = false;

  pipe = new DatePipe('pt-BR');

  @Output('filtro') filtro: EventEmitter<FiltroGarantiasRegistros> = new EventEmitter<FiltroGarantiasRegistros>();

  constructor(private dominioService: DominioService,) {}

  ngOnInit() {
    this.carregarUfs();
  }

  search(event) {
    let tipoRegistro = event.get(this.fieldTipoRegistro.id);
    let uf = event.get(this.fieldUf.id);

    this.filtroGarantias = <FiltroGarantiasRegistros>{
      tipoRegistro: tipoRegistro? tipoRegistro : '',
      uf: uf?.length > 0 ? uf : [],
    };

    this.filtro.emit(this.filtroGarantias);
    this.showRedefinirBtn = true;
  }

  redefinirFiltros() {
    this.filtroGarantias = null;
    this.refreshGrid = !this.refreshGrid;
    this.showRedefinirBtn = false;
    this.filtro.emit(this.filtroGarantias);
  }

  setCustomControls(event: Map<string, AbstractControl>) {
    this.tipoRegistroControl = event.get(
      this.fieldTipoRegistro.id
    ) as FormControl;
  
    this.ufControl = event.get(
      this.fieldUf.id
    ) as FormControl;
  }

  redefinir(control: FormControl) {
    control.reset();
  }

  selectAll(fieldReturn: FilterFieldReturn, filtro: string) {
    switch (filtro) {
      case 'uf':
        this.selectAllOptions(
          this.ufControl,
          fieldReturn.selected,
          this.fieldUf.options
        );
        break;

      default:
        break;
    }
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