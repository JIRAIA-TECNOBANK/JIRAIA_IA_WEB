import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatLegacyMenuTrigger as MatMenuTrigger } from '@angular/material/legacy-menu';
import { Utility } from 'src/app/core/common/utility';
import { FiltroGraficosComplementares } from 'src/app/modules/sistemas/sub-modules/crm/core/models/dashboard/filtro-graficos-complementares.model';

@Component({
  selector: 'app-filtro-graficos',
  templateUrl: './filtro-graficos.component.html',
  styleUrls: ['./filtro-graficos.component.scss']
})
export class FiltroGraficosComponent implements OnInit {

  utility = Utility;
  private periodoInicial = 30;
  private dataFim = new Date();
  private dataInicio = new Date();

  constructor(private formBuilder: UntypedFormBuilder) { }

  @Input('refresh') set setRefresh(value) {
    this.carregarPeriodo();
  }
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @Input('refresh') set setAtualizaPagina(value) {
    this.limparFiltros();
  }
  @Output('filtrosComplementares') filtrosComplementares: EventEmitter<FiltroGraficosComplementares> = new EventEmitter<FiltroGraficosComplementares>();

  pipe = new DatePipe('en-US');

  filtroForm = this.formBuilder.group({
    dataInicial: [null],
    dataFinal: [null]
  });

  periodoPadrao: boolean = true;
  periodoSelecionado: number = this.periodoInicial;

  dataInicial;
  dataFinal;

  ngOnInit(): void {
    this.carregarPeriodo();
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

  stopPropagation(event) {
    event.stopPropagation();
  }

  limparFiltros() {
    this.filtroForm.reset();
    this.periodoPadrao = false;
    this.selecionarPeriodo(this.periodoInicial);
  }

  selecionarPeriodo(dias: number) {
    if (this.periodoPadrao && dias === this.periodoSelecionado) { return; }

    this.periodoSelecionado = dias;
    this.periodoPadrao = true;

    this.filtroForm.get('dataInicial').reset();
    this.filtroForm.get('dataFinal').reset();
    this.carregarPeriodo();
  }

  verificarFiltrosPersonalizados() {
    let formValue = Object.keys(this.filtroForm.value).some(v => !!this.filtroForm.value[v]);
    if (formValue) {
      return true;
    }

    return false;
  }

  confirmarFiltros() {
    if (this.verificarFiltrosPersonalizados()) {
      if (this.filtroForm.value['dataInicial'] || this.filtroForm.value['dataFinal']) {
        this.periodoPadrao = false;
        let inicio = this.filtroForm.value['dataInicial']._d;
        let fim = this.filtroForm.value['dataFinal']._d;

        this.dataInicio = inicio;
        this.dataFim = fim;

        this.periodoSelecionado = Math.floor((Date.UTC(fim.getFullYear(), fim.getMonth(), fim.getDate()) - Date.UTC(inicio.getFullYear(), inicio.getMonth(), inicio.getDate())) / (1000 * 60 * 60 * 24))
      }

      this.emitirFiltro();
    }
  }

  private carregarPeriodo() {
    this.dataFim = new Date();
    this.dataInicio = new Date();

    this.dataInicio.setDate(this.dataFim.getDate() - this.periodoSelecionado);
    this.emitirFiltro();
  }

  private emitirFiltro() {
    this.filtrosComplementares.emit(<FiltroGraficosComplementares>{
      dataInicio: this.pipe.transform(this.dataInicio, 'yyyy-MM-dd'),
      dataFim: this.pipe.transform(this.dataFim, 'yyyy-MM-dd')
    });
  }

}
