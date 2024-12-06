import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatLegacyOption as MatOption } from '@angular/material/legacy-core';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { TipoFilterField } from '../../core/enums/tipo-filter-field.enum';
import { FieldOption } from '../../core/models/grid-filter/field-option.model';
import { FilterFieldReturn } from '../../core/models/grid-filter/filter-field-return.model';
import { FilterField } from '../../core/models/grid-filter/filter-field.model';
import { SortByPipe } from '../../pipes/sort-by.pipe';
import { debug } from 'console';

@Component({
  selector: 'app-filter-field',
  templateUrl: './filter-field.component.html',
  styleUrls: ['./filter-field.component.scss'],
})
export class FilterFieldComponent implements OnInit {
  utility = Utility;
  formularioFiltro: FormGroup;
  labelInsideFilter: string = null;
  listOptionsSelected: FieldOption[] = [];
  requiredFieldsError: boolean = false;
  minDate: Date;
  minInitialDate: Date;
  maxDate: Date;
  erroDataFinal: boolean = false;
  customControls: Map<string, AbstractControl>;
  sortPipe = new SortByPipe();

  verifyDefaultValue: boolean = false;

  @Input() field: FilterField;
  @Input() control: FormControl;
  @Input() searchControl: FormControl;
  @Input() customFields: boolean = false;
  @Input() dataMaxima: number = 180;
  @Input('customControls') set setCustomControls(value) {
    if (value) {
      this.customControls = value;
    }
  }
  @Input('redefinirField') set setRedefinir(value) {
    this.redefinir();
  }
  @Output('selectAll') selectAll: EventEmitter<FilterFieldReturn> =
    new EventEmitter<FilterFieldReturn>();
  @Output('searchInput') searchInput: EventEmitter<FieldOption> =
    new EventEmitter<FieldOption>();
  @Output('triggerSearch') triggerSearch: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  @ViewChild('allSelectedOptions') private allSelectedOptions: MatOption;

  deControlName: string;
  ateControlName: string;

  constructor() {
    this.maxDate = new Date();
    this.minInitialDate = new Date();
  }

  ngOnInit(): void {
    this.deControlName = !this.customFields? this.field.id + '_De' : 'De';
    this.ateControlName = !this.customFields? this.field.id + '_Ate' : 'Ate';

    this.minInitialDate.setDate(this.minInitialDate.getDate() - this.dataMaxima);
    this.setLabel();

    this.orderOptions();

    this.control.valueChanges.subscribe(() => {
      if (this.field.tipo == TipoFilterField.Checkbox && this.field.searchInput && this.field.defaultValue && !this.verifyDefaultValue) {
        this.verifyDefaultValue = true;
        this.selectDefaultValuesMultipleSelect();
      }
    })

    if (!this.field.maxDays) this.field.maxDays = this.dataMaxima;
  }

  toggleSelectAllOptions() {
    this.selectAll.emit(<FilterFieldReturn>{
      field: this.field,
      selected: this.allSelectedOptions.selected ? true : false,
    });
  }

  setLabel() {
    this.labelInsideFilter = this.field.titulo;
    if (this.labelInsideFilter.includes('Filtre')) {
      this.labelInsideFilter = this.labelInsideFilter.replace('Filtre ', '');
    }

    let first = this.labelInsideFilter.substr(0, 1).toUpperCase();
    this.labelInsideFilter = first + this.labelInsideFilter.substr(1);
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  redefinir() {
    this.control.reset();
    if (this.field.searchInput) {
      this.searchControl.reset();
      this.onChangeSearch(null, true);
    }

    if (this.field.tipo == TipoFilterField.Period) {
      this.getFormControl(this.deControlName)?.reset();
      this.getFormControl(this.ateControlName)?.reset();
    }
  }

  onChangeSearch(value: string, reset?: boolean) {
    if (reset || value == '') {
      this.searchInput.emit(<FieldOption>{ label: this.field.id, value: '' });
      if (reset) {
        this.listOptionsSelected = [];
        return;
      }
      this.updateOptions();
      return;
    }

    if (value.length >= 3) {
      this.searchInput.emit(<FieldOption>{
        label: this.field.id,
        value: value,
      });
      this.updateOptions();
    }
  }

  updateOptions() {
    Utility.waitFor(() => {
      this.listOptionsSelected.forEach((selected) => {
        let option = this.field.options.filter(
          (op) => op.value == selected.value
        )[0];
        if (option) {
          this.field.options.splice(this.field.options.indexOf(option), 1);
        }
      });
    }, 1000);
  }

  setControlValue() {
    let options = [];
    this.listOptionsSelected.forEach((op) => {
      options.push(op.value);
    });
    this.control.patchValue(options);

    this.listOptionsSelected.forEach((selected) => {
      let option = this.field.options.filter((op) => op.value == selected.value)[0];
      if (option) {
        this.field.options.splice(this.field.options.indexOf(option), 1);
      }
    });
  }

  toggleOption(option) {
    if (!this.field.searchInput) {
      const index: number = this.control.value?.indexOf('selectAll');
      const valores = this.control.value;
      let valoresAux = valores;

      if (index !== undefined && index !== -1) {
        valoresAux = valores.splice(index, 1);
        if (this.field.options.length == valoresAux.length) {
          return;
        }
        this.allSelectedOptions.deselect();
        return;
      }

      if (this.field.options.length == valoresAux.length) {
        this.allSelectedOptions.select();
      }
      return;
    }

    let selected = this.listOptionsSelected.filter(
      (o) => o.value == option.value
    )[0];
    if (selected) {
      this.listOptionsSelected.splice(
        this.listOptionsSelected.indexOf(selected),
        1
      );

      this.field.options.push(selected);
      let optionsAux = this.sortPipe.transform(this.field.options, 'desc', 'value');
      this.field.options = optionsAux;
      this.setControlValue();
      return;
    }

    this.listOptionsSelected.push(option);
    this.setControlValue();
  }

  onKeyEnter(event) {
    if (event.key != 'Enter') return;
    this.triggerSearch.emit(true);
  }

  getFormControl(id: string): AbstractControl {
    if (this.customControls) {
      return this.customControls.get(id) != undefined
        ? this.customControls.get(id)
        : new FormControl();
    }
    return new FormControl();
  }

  cleanDates() {
    this.getFormControl(this.deControlName).reset();
    this.getFormControl(this.ateControlName).reset();
    Utility.waitFor(() => {
      this.validaCamposObrigatorios();
    }, 500);
  }

  onChangePeriodo(value: any, inicial: boolean) {
    this.control.reset();

    if (inicial) {
      this.setaDataMinima(value);
    } else {
      this.verificaData(value);
    }

    this.validaCamposObrigatorios();
  }

  setaDataMinima(dataFinal: any) {
    let data1;
    data1 = Utility.formatDate(dataFinal);

    const data1Split = data1.split('-');
    this.minDate = new Date(data1Split[2], data1Split[1] - 1, data1Split[0]);

    this.minInitialDate = new Date();
    this.minInitialDate.setDate(this.minDate.getDate() - this.dataMaxima);
  }

  verificaData(dataFinal: any) {
    let data1;
    let data2;

    data1 = Utility.formatDate(this.getFormControl(this.deControlName).value);
    data2 = Utility.formatDate(dataFinal);

    if (data1 !== '' && data2 !== '') {
      const data1Split = data1.split('-');
      const data2Split = data2.split('-');
      const novaData1 = new Date(
        data1Split[2],
        data1Split[1] - 1,
        data1Split[0]
      );
      const novaData2 = new Date(
        data2Split[2],
        data2Split[1] - 1,
        data2Split[0]
      );

      if (novaData1.getTime() <= novaData2.getTime()) {
        this.erroDataFinal = false;
      } else {
        this.erroDataFinal = true;
        this.getFormControl(this.ateControlName).setValue('');
      }
    }
  }

  public getElementId(
    tipoElemento: number,
    nomeElemento: string,
    guidElemento: any = null
  ): string {
    return `${TipoElemento[tipoElemento]}-${nomeElemento}${guidElemento != null ? '_' + guidElemento : ''
      }`;
  }

  triggerFocus(id: string) {
    //focar o elemento pelo ID
    document.getElementById(this.getElementId(0, 'filter', id)).focus();
  }

  addDays = (input, days) => {
    if (input) {
      const date = input._d ? new Date(input._d) : new Date(input);
      date.setDate(date.getDate() + days);
      date.setDate(Math.min(date.getDate(), this.getDaysInMonth(date.getFullYear(), date.getMonth() + 1)));

      return date;
    }
  };

  getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();

  stopMatMenuClosing(event: KeyboardEvent) {
    event.stopPropagation();
  }

  private validaCamposObrigatorios() {
    if (
      !this.control.value &&
      (!this.getFormControl(this.deControlName).value || !this.getFormControl(this.ateControlName).value)
    ) {
      this.requiredFieldsError = true;
      return false;
    }

    this.requiredFieldsError = false;
    return true;
  }

  private selectDefaultValuesMultipleSelect() {
    this.listOptionsSelected = [];

    const option = this.field.defaultValue;
    this.listOptionsSelected.push(option);
    this.field.options = [];
    this.control.patchValue([option.value]);
  }

  private orderOptions() {
    if (this.field.orderOptions) {
      let optionsAux = this.sortPipe.transform(this.field.options, 'desc', 'value');
      this.field.options = optionsAux;
    }
  }
}
