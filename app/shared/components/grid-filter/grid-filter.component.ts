import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { TipoFilterField } from '../../core/enums/tipo-filter-field.enum';
import { FieldOption } from '../../core/models/grid-filter/field-option.model';
import { FilterFieldReturn } from '../../core/models/grid-filter/filter-field-return.model';
import { FilterField } from '../../core/models/grid-filter/filter-field.model';
import { GridFilter } from '../../core/models/grid-filter/grid-filter.model';

@Component({
  selector: 'app-grid-filter',
  templateUrl: './grid-filter.component.html',
  styleUrls: ['./grid-filter.component.scss']
})
export class GridFilterComponent implements OnInit {

  @Output('pesquisar') pesquisar: EventEmitter<Map<string, string>> = new EventEmitter<Map<string, string>>();
  @Output('customControls') customControls: EventEmitter<Map<string, AbstractControl>> = new EventEmitter<Map<string, AbstractControl>>();
  @Output('redefinir') btnRedefinir: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output('onSearchInput') searchInput: EventEmitter<FieldOption> = new EventEmitter<FieldOption>();
  @Input() filter: GridFilter;
  @Input('triggerShowMore') set triggerShowMore(value: boolean) { if (value) { this.showMore = true; } }
  @Input() radiusTop: boolean = true;
  @Input() showRedefinir: boolean = false;
  @Input() dataMaxima: number = 180;

  maxNumberFields: number = 4;

  filterActive: boolean = false;
  showMore: boolean = false;
  firstRow: FilterField[];
  secondRow: FilterField[];

  formulario: FormGroup;
  filterMap = new Map<string, any>();
  redefinirField: boolean = false;

  customFormControls: Map<string, AbstractControl>;

  constructor(private fb: UntypedFormBuilder) { }

  ngOnInit(): void {
    if (this.filter.maxNumberFields) { this.maxNumberFields = this.filter.maxNumberFields }

    this.splitFilter();
    this.initializeForm();
  }

  splitFilter() {
    this.setFirstFieldLabel();

    if (this.filter.fields.length <= this.maxNumberFields) {
      this.firstRow = this.filter.fields;
      this.secondRow = [];
      return;
    }

    this.firstRow = this.filter.fields.slice(0, this.maxNumberFields);
    this.secondRow = this.filter.fields.slice(this.maxNumberFields, this.filter.fields.length);
  }

  initializeForm() {
    this.formulario = this.fb.group({});
    let customControls = new Map<string, AbstractControl>();

    for (let i = 0; i < this.filter.fields.length; i++) {
      this.setControl(this.filter.fields[i].id, customControls, this.filter.fields[i].validators, this.filter.fields[i].tipo == TipoFilterField.Checkbox ? null : '')

      if (this.filter.fields[i].tipo == TipoFilterField.Custom) {
        for (let j = 0; j < this.filter.fields[i].customFields.length; j++) {
          this.setControl(this.filter.fields[i].customFields[j].id, customControls, this.filter.fields[i].customFields[j].validators, '')
        }
      }

      if (this.filter.fields[i].searchInput) {
        this.setControl(this.filter.fields[i].id + '_search', customControls, Validators.minLength(3), '');
      }

      if (this.filter.fields[i].tipo == TipoFilterField.Period) {
        if (!this.filter.customFields) {
          this.setControl(this.filter.fields[i].id + '_De', customControls, this.filter.fields[i].validators != undefined ? this.filter.fields[i].validators : Validators.nullValidator)
          this.setControl(this.filter.fields[i].id + '_Ate', customControls, this.filter.fields[i].validators != undefined ? this.filter.fields[i].validators : Validators.nullValidator)
        }
        else {
          this.setControl('De', customControls, this.filter.fields[i].validators != undefined ? this.filter.fields[i].validators : Validators.nullValidator)
          this.setControl('Ate', customControls, this.filter.fields[i].validators != undefined ? this.filter.fields[i].validators : Validators.nullValidator)
        }

        this.customFormControls = customControls;
      }
    }

    if (this.filter.customFields) {
      this.customControls.emit(customControls);
    }
  }

  setControl(id: string, customControls: Map<string, AbstractControl>, validators?: Validators, defaultValue?: any) {
    this.addControl(this.defaultControlName(id), validators, defaultValue);
    customControls.set(id, this.getFormControl(id));
  }

  selectAll(fieldReturn: FilterFieldReturn) {
    if (fieldReturn.selected) {
      this.formulario.controls[this.defaultControlName(fieldReturn.field.id)]
        .patchValue([...fieldReturn.field.options.map(item => item.value), 'selectAll']);
      return;
    }

    this.formulario.controls[this.defaultControlName(fieldReturn.field.id)].patchValue([]);
  }

  addControl(controlName: string, validators?: Validators, defaultValue?: any) {
    this.formulario.addControl(controlName, new FormControl(defaultValue, validators));
  }

  getFormControl(id: string): AbstractControl {
    return this.formulario.controls[this.defaultControlName(id)];
  }

  setFirstFieldLabel() {
    if (this.filter.fields[0].titulo?.includes('Filtre')) return;

    let first = this.filter.fields[0].titulo.substr(0, 1).toLowerCase();
    this.filter.fields[0].titulo = 'Filtre ' + first + this.filter.fields[0].titulo.substr(1);
  }

  onClickPesquisar() {
    if (!this.formulario.valid) {
      let invalidControls = this.findInvalidControls();
      if (invalidControls.length > 0) {
        this.formulario.markAllAsTouched();
        return;
      }
    }

    this.mapFilter();
    this.pesquisar.emit(this.filterMap);
  }

  mapFilter() {
    this.filterMap = new Map<string, string>();

    for (let i = 0; i < this.filter.fields.length; i++) {
      if (this.filter.fields[i].selectAllOptions) {
        this.findSelectAll(this.formulario.controls[this.defaultControlName(this.filter.fields[i].id)].value)
      }

      if (this.filter.fields[i].tipo == TipoFilterField.Custom) {
        let customFieldsValues = [{ id: 'default', value: this.formulario.controls[this.defaultControlName(this.filter.fields[i].id)].value }];

        for (let j = 0; j < this.filter.fields[i].customFields.length; j++) {
          customFieldsValues.push({ id: this.filter.fields[i].customFields[j].id, value: this.formulario.controls[this.defaultControlName(this.filter.fields[i].customFields[j].id)].value })
        }

        this.setFilterMap(this.filter.fields[i].id, customFieldsValues);
      }
      else {
        this.setFilterMap(this.filter.fields[i].id, this.formulario.controls[this.defaultControlName(this.filter.fields[i].id)].value);

        if (this.filter.fields[i].tipo == TipoFilterField.Period) {
          this.setDatas(this.filter.fields[i], this.filter.customFields);
        }
      }
    }
  }

  setFilterMap(id: string, value: any) {
    this.filterMap.set(id, value);
  }

  findSelectAll(value: any[]) {
    const index: number = value?.indexOf('selectAll');
    if (index !== undefined && index !== -1) { value = value.splice(index, 1); }
  }

  redefinir() {
    this.formulario.reset();
    this.btnRedefinir.emit(true);
    this.redefinirField = !this.redefinirField;
  }

  onSearchInput(event) {
    this.searchInput.emit(event);
  }

  showRedefinirButton() {
    if (this.showRedefinir == null) { return this.formulario.touched; }

    let touched = false;

    let defaultControls = ['filter_DataInicio', 'filter_DataFim'];

    Object.keys(this.formulario.controls).forEach(control => {
      if (this.formulario.get(control).value) {
        if (this.formulario.get(control).value.length > 0 || this.formulario.get(control).value > 0) {
          touched = true;
        }
      }
    });

    if (!touched) { if (this.showRedefinir) touched = true; }

    return touched;
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return `${TipoElemento[tipoElemento]}-${nomeElemento}${guidElemento != null ? '_' + guidElemento : ''}`;
  }

  private setDatas(field: FilterField, customFields: boolean) {
    let dataInicialId =  !customFields ?  field.id + '_De' : 'De';
    let dataFinalId = !customFields ? field.id + '_Ate' : 'Ate';

    let value = this.filterMap.get(field.id);

    if (this.filterMap.get(field.id)) {
      const date = new Date();
      this.setFilterMap(dataFinalId, this.transformaDataParaPadraoApi(date));

      switch (value) {
        case 'P_ULTIMO_30_DIAS':
          this.setFilterMap(dataInicialId, this.subtrairDias(date, 30));
          break;
        case 'P_ULTIMO_60_DIAS':
          this.setFilterMap(dataInicialId, this.subtrairDias(date, 60));
          break;
        case 'P_ULTIMO_90_DIAS':
          this.setFilterMap(dataInicialId, this.subtrairDias(date, 90));
          break;
      }

      return;
    }

    let dataInicialValue = this.getFormControl(dataInicialId).value;

    if (dataInicialValue) {
      let dataInicial = Utility.formatDate(dataInicialValue)

      const dataISplit = dataInicial.split('-')
      this.setFilterMap(dataInicialId, `${dataISplit[1]}-${dataISplit[0]}-${dataISplit[2]}`);

      let dataFinal = Utility.formatDate(this.getFormControl(dataFinalId).value)

      const dataFSplit = dataFinal.split('-')
      this.setFilterMap(dataFinalId, `${dataFSplit[1]}-${dataFSplit[0]}-${dataFSplit[2]}`);
    }
  }

  private transformaDataParaPadraoApi(date: Date): string {
    const data = new Date(Number(date))
    let novaData
    let dataPadraoApi
    novaData = data.toISOString().split('T')[0].split('-')
    dataPadraoApi = `${novaData[1]}-${novaData[2]}-${novaData[0]}`
    return dataPadraoApi
  }

  private subtrairDias(date: Date, days: number): string {
    const data = new Date(Number(date))
    let novaData
    let dataPadraoApi
    data.setDate(date.getDate() - days)
    novaData = data.toISOString().split('T')[0].split('-')
    dataPadraoApi = `${novaData[1]}-${novaData[2]}-${novaData[0]}`
    return dataPadraoApi
  }

  private defaultControlName(id: string) { return 'filter_' + id; }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.formulario.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        if (!name.endsWith('_search')) { invalid.push(name); }
      }
    }
    return invalid;
  }
}
