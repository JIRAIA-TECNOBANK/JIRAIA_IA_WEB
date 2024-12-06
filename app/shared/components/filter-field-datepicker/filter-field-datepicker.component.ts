import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import * as _moment from 'moment';
import { Moment } from 'moment';
import { Utility } from 'src/app/core/common/utility';
import { FilterField } from '../../core/models/grid-filter/filter-field.model';

const moment = _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-filter-field-datepicker',
  templateUrl: './filter-field-datepicker.component.html',
  styleUrls: ['./filter-field-datepicker.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class FilterFieldDatepickerComponent {

  utility = Utility;
  date = new FormControl(moment(new Date((new Date).getFullYear(), (new Date).getMonth(), 1)));
  minDate = new Date(2024, 0, 1);

  @Input() field: FilterField;
  @Input() control: FormControl;
  @Input() labelInsideFilter: string;

  triggerFocus(id: string) {
    document.getElementById(this.utility.getElementId(0, 'filter', id)).focus();
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  redefinir() {
    this.control.reset();
  }

  chosenYearHandler(normalizedYear: Moment) {
    const ctrlValue = this.date.value;
    ctrlValue.year(normalizedYear.year());
    this.control.setValue(ctrlValue);
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value;
    ctrlValue.month(normalizedMonth.month());
    this.control.setValue(ctrlValue);
    datepicker.close();
  }

}
