import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { ResumoRegistrosFiltro } from 'src/app/modules/sistemas/sub-modules/crm/core/models/dashboard/resumo-registros-filtro.model';
import { RegistrosConsolidadosResponse } from 'src/app/modules/sistemas/sub-modules/crm/core/responses/dashboard/registros-consolidados.response';
import { DashboardService } from 'src/app/modules/sistemas/sub-modules/crm/services/dashboard.service';

@Component({
  selector: 'app-resumo-botoes',
  templateUrl: './resumo-botoes.component.html',
  styleUrls: ['./resumo-botoes.component.scss']
})
export class ResumoBotoesComponent implements OnInit {

  utility = Utility;
  private pipe = new DatePipe('en-US');

  constructor(private dashboardService: DashboardService) { }

  tipoSelecionado: 'success' | 'warning' | 'danger';
  @Input('filtros') filtros: ResumoRegistrosFiltro;
  @Output() consultar: EventEmitter<string> = new EventEmitter<string>();
  @Output() mostrarLinhaGrafico: EventEmitter<string> = new EventEmitter<string>();

  consolidated: RegistrosConsolidadosResponse;
  tabInconsistentesIndex: number = 1;
  tabImgPendenteIndex: number = 1;

  total: number;

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.tipoSelecionado = null;
    this.carregarValores();
  }

  carregarValores() {
    let start = this.pipe.transform(this.filtros.dataInicial, 'yyyy-MM-dd');
    let end = this.pipe.transform(this.filtros.dataFinal, 'yyyy-MM-dd');

    this.dashboardService.obterRegistrosConsolidados(start, end, this.filtros.ufs, this.filtros.empresasId)
      .subscribe({
        next: (consolidated: RegistrosConsolidadosResponse) => {
          this.consolidated = consolidated;
          this.total = this.consolidated.qtdeContratosRegistrados + this.consolidated.qtdeContratosComInconsistencia;
        }
      })
  }

  consultarRegistros(tipoBotao: string) {
    this.consultar.emit(tipoBotao);
  }

  selecionarTipo(tipo: 'success' | 'warning' | 'danger') {
    if (this.tipoSelecionado == tipo) {
      this.tipoSelecionado = null;
      this.mostrarLinhaGrafico.emit(null);
      return;
    }

    this.tipoSelecionado = tipo;
    this.mostrarLinhaGrafico.emit(tipo);
  }

  obterTooltip(porcentagem: number, tipo: 'success' | 'warning' | 'danger') {
    if (this.filtros.periodoPadrao) {
      return `${porcentagem}% dos contratos enviados ${this.retornarTipoContratosTooltip(tipo)} nos últimos ${this.filtros.periodoSelecionado} dias.`;
    }

    return `${porcentagem}% dos contratos enviados ${this.retornarTipoContratosTooltip(tipo)} nos ${this.filtros.periodoSelecionado} dias selecionados.`;
  }

  calcularPorcentagem(tipo: 'success' | 'warning' | 'danger') {
    if (!this.consolidated) return null;

    if (tipo === 'success') {
      if (this.consolidated.qtdeContratosRegistrados === 0) return null;
      return this.consolidated.qtdeContratosRegistrados / this.total;
    }

    if (tipo === 'warning') {
      if (this.consolidated.qtdeContratosComInconsistencia === 0) return null;
      return this.consolidated.qtdeContratosComInconsistencia / this.total;
    }
  }

  private retornarTipoContratosTooltip(tipo: 'success' | 'warning' | 'danger') {
    if (tipo === 'success') {
      return 'foram registrados';
    }

    if (tipo === 'warning') {
      return 'estão com inconsistência';
    }
  }
}
