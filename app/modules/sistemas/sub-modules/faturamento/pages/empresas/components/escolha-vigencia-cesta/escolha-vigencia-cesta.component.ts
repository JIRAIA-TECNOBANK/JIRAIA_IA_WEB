import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';

@Component({
  selector: 'app-escolha-vigencia-cesta',
  templateUrl: './escolha-vigencia-cesta.component.html',
  styleUrls: ['./escolha-vigencia-cesta.component.scss']
})
export class EscolhaVigenciaCestaComponent implements OnInit {

  utility = Utility;
  hoje = new Date();
  diasMesVigente = new Date().getDate();

  @Input('opcaoVigenciaControl') opcaoVigenciaControl: FormControl;
  @Input('dataInicioVigenciaControl') dataInicioVigenciaControl: FormControl;
  @Input('mostrarTitulo') mostrarTitulo: boolean = true;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.hoje.setHours(0, 0, 0);
    this.opcaoVigenciaControl.valueChanges.subscribe(value => {
      this.dataInicioVigenciaControl.reset();

      if (value == 0) {
        this.dataInicioVigenciaControl.setValidators([Validators.required]);
        this.dataInicioVigenciaControl.updateValueAndValidity();
        this.dataInicioVigenciaControl.patchValue(this.hoje);
        return;
      }
    });
  }

  addDays = (days) => {
    const date = new Date();

    date.setDate(date.getDate() + days);
    date.setDate(Math.min(date.getDate(), this.getDaysInMonth(date.getFullYear(), date.getMonth() + 1)));
    return date;
  };

  getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
}
