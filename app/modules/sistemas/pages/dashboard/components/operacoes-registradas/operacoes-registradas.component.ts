import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';
import { BlocoVazio } from 'src/app/modules/sistemas/core/models/common/bloco-vazio.model';
import { FiltroGraficosComplementares } from 'src/app/modules/sistemas/sub-modules/crm/core/models/dashboard/filtro-graficos-complementares.model';
import { OperacoesRegistradas } from 'src/app/modules/sistemas/sub-modules/crm/core/models/dashboard/operacoes-registradas.model';
import { DashboardService } from 'src/app/modules/sistemas/sub-modules/crm/services/dashboard.service';

@Component({
  selector: 'app-operacoes-registradas',
  templateUrl: './operacoes-registradas.component.html',
  styleUrls: ['./operacoes-registradas.component.scss']
})
export class OperacoesRegistradasComponent implements OnInit {

  constructor(private dashboardService: DashboardService) { }

  @Input('filtro') filtro: FiltroGraficosComplementares;

  @Output('totalSucesso') totalSucesso: EventEmitter<number> = new EventEmitter<number>();
  @Output('totalInconsistencia') totalInconsistencia: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild('grafico', { static: false }) grafico: ChartComponent;
  @ViewChild('graficoAux', { static: false }) graficoAux: ChartComponent;
  public chartOptions;
  public chartOptionsAux;

  dadosGrafico: OperacoesRegistradas[] = [];
  loading: boolean = true;

  blocoVazio: BlocoVazio = {
    id: 'operacoes-registradas',
    titulo: 'Operações registradas',
    icone: './../../../../assets/img/custom-icons/icone-vazio-lapis.svg',
    subtitulo: `Nenhuma operação <br>adicionada recentemente.`,
    mensagem: `Continue utilizando a nossa plataforma para <br>ter a melhor experiência em nosso dashboard.`,
  };

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.carregarDadosGrafico();
  }

  private carregarDadosGrafico() {
    this.loading = true;
    this.dadosGrafico = [];
    this.totalSucesso.emit(null);
    this.totalInconsistencia.emit(null);

    this.dashboardService.obterOperacoesRegistradas(this.filtro.dataInicio, this.filtro.dataFim).subscribe(response => {
      if (response.operacoesRegistradas?.length > 0) {
        this.dadosGrafico = response.operacoesRegistradas;
        let totalSucesso = this.dadosGrafico.filter(d => d.status === 'REGISTRADO')[0]?.total || 0;
        let totalInconsistencia = this.dadosGrafico.filter(d => d.status === 'INCONSISTENCIA')[0]?.total || 0;

        let series: number[] = [
          totalSucesso,
          totalInconsistencia
        ];

        this.totalSucesso.emit(totalSucesso);
        this.totalInconsistencia.emit(totalInconsistencia);

        this.loading = false;

        this.carregarGrafico(series);

        return;
      }

      this.totalSucesso.emit(0);
      this.totalInconsistencia.emit(0);
      this.loading = false;
    })
  }

  private carregarGrafico(series: number[]) {
    this.chartOptions = {
      series: series,
      chart: {
        type: 'donut',
        labels: ['Sucesso', 'Inconsistências']
      },
      legend: {
        show: false,
        position: 'bottom',
        fontFamily: 'Montserrat Regular, sans-serif',
      },
      colors: ['#9EF19C', '#FEA481'],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: false,
        curve: 'stepline',
        lineCap: 'butt',
        colors: '#FFF',
      },
      tooltip: {
        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
          let label: string = w.config.chart.labels[seriesIndex];
          let valor = series[seriesIndex].toLocaleString()

          return `<div class='tooltip-box grafico-rosquinha'>
              <label class='bold labels'>
                Contratos com <br>${label.toLowerCase()}
              </label>
              <div class='row pt-1'>
                <span class='tooltip-value'>${valor}</span>
              </div>
              </div`;
        }
      },
      plotOptions: {
        pie: {
          startAngle: 0,
          endAngle: 360,
          expandOnClick: false,
          offsetX: 0,
          offsetY: 0,
          customScale: 1,
          dataLabels: {
            offset: 0,
            minAngleToShowLabel: 365
          },
          donut: {
            size: '75%',
            background: 'transparent',
            labels: {
              show: true,
              value: {
                show: true,
                fontSize: '32px',
                fontFamily: 'Montserrat Bold, sans-serif',
                fontWeight: 700,
                color: '#384047',
                offsetY: 16,
                formatter: function (val) {
                  return val
                }
              },
              total: {
                show: true,
                showAlways: true,
                label: 'Total',
                fontSize: '12px',
                fontFamily: 'Montserrat Regular, sans-serif',
                fontWeight: 400,
                color: '#384047',
                formatter: function (w) {
                  let total = w.globals.seriesTotals.reduce((a, b) => {
                    return a + b
                  }, 0);

                  return total.toLocaleString();
                }
              }
            }
          },
        }
      }
    }

    this.carregarGraficoAuxiliar(series);
  }

  private carregarGraficoAuxiliar(series: number[]) {
    this.chartOptionsAux = {
      series: series,
      chart: {
        type: 'donut',
      },
      legend: {
        show: false,
      },
      colors: ['#9EF19C', '#FEA481'],
      stroke: {
        show: false,
      },
      fill: {
        colors: ['#C9F2C8', '#FFCAB5'],
        type: 'solid',
      },
      plotOptions: {
        pie: {
          startAngle: 0,
          endAngle: 360,
          expandOnClick: false,
          offsetX: 0,
          offsetY: 0,
          customScale: 1,
          dataLabels: {
            offset: 0,
            minAngleToShowLabel: 365
          },
          donut: {
            size: '65%',
            background: 'transparent',
            labels: {
              show: false,
            }
          },
        }
      },
      tooltip: {
        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
          let label: string = w.config.chartOptions.labels[seriesIndex];

          return `<div class='tooltip-box grafico-rosquinha'>
              <label class='bold labels'>
                Contratos com <br>${label.toLowerCase()}
              </label>
              <div class='row pt-1'>
                <span class='tooltip-value'>${series[seriesIndex]}</span>
              </div>
              </div`;
        }
      }
    }
  }

}
