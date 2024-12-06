import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatLegacyOption as MatOption } from '@angular/material/legacy-core';
import { MatLegacyMenuTrigger as MatMenuTrigger } from '@angular/material/legacy-menu';
import { ActivatedRoute, Router } from '@angular/router';
import * as ApexCharts from 'apexcharts';
import { ChartComponent } from 'ng-apexcharts';
import { Utility } from 'src/app/core/common/utility';
import { BlocoVazio } from 'src/app/modules/sistemas/core/models/common/bloco-vazio.model';
import { FiltrarTransacoesRequest } from 'src/app/modules/sistemas/sub-modules/admin/core/requests/usuarios/transacoes/filtrar-transacoes.request';
import { TransacaoService } from 'src/app/modules/sistemas/sub-modules/admin/services/_portal/transacao.service';
import { ResumoRegistrosFiltro } from 'src/app/modules/sistemas/sub-modules/crm/core/models/dashboard/resumo-registros-filtro.model';
import { Empresas } from 'src/app/modules/sistemas/sub-modules/crm/core/models/empresas/empresas.model';
import { ResumoRegistrosResponse } from 'src/app/modules/sistemas/sub-modules/crm/core/responses/dashboard/resumo-registros.response';
import { DashboardService } from 'src/app/modules/sistemas/sub-modules/crm/services/dashboard.service';
import { DominioService } from 'src/app/modules/sistemas/sub-modules/crm/services/dominio.service';
import { EmpresasService } from 'src/app/modules/sistemas/sub-modules/crm/services/empresas.service';
import { SortByPipe } from 'src/app/shared/pipes/sort-by.pipe';

@Component({
  selector: 'app-grafico-resumo',
  templateUrl: './grafico-resumo.component.html',
  styleUrls: ['./grafico-resumo.component.scss']
})
export class GraficoResumoComponent implements OnInit {

  utility = Utility;

  constructor(private dashboardService: DashboardService,
    private transacaoService: TransacaoService,
    private formBuilder: UntypedFormBuilder,
    private dominioService: DominioService,
    private empresaService: EmpresasService,
    private router: Router,
    private activatedRoute: ActivatedRoute) { }

  private periodoInicial = 30;
  private dataInicio = new Date();
  private dataFim = new Date();
  private pipe = new DatePipe('en-US');

  @Input('linhaGrafico') set setLinhaGrafico(value) {
    this.obterLinhaFiltroGrafico(value);
  }

  @Input('consultaMonitorOperacoes') set setConsultaMonitorOperacoes(tipo) {
    if (tipo) {
      this.consultarRegistros(tipo);
    }
  }

  @Input('refresh') set setAtualizaPagina(value) {
    this.limparFiltros();
  }

  @Output('filtros') filtros: EventEmitter<ResumoRegistrosFiltro> = new EventEmitter<ResumoRegistrosFiltro>();

  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @ViewChild('todasUFs') private todasUFs: MatOption;
  @ViewChild('chartLines', { static: false }) chart: ChartComponent;
  public chartOptions;
  objetoGrafico: ApexCharts;

  periodoSelecionado: number = this.periodoInicial;
  intervals: string[] = [];

  tipoSelecionado: 'success' | 'warning' | 'danger';
  periodoPadrao: boolean = true;

  filtroForm = this.formBuilder.group({
    uf: [null],
    empresaNome: [null],
    empresaCnpj: [null],
    empresaId: [null],
    dataInicial: [null],
    dataFinal: [null]
  });

  ufDetrans: string[] = [];

  empresas: Empresas[] = [];
  empresasFiltradas: Empresas[] = [];
  loading: boolean = false;
  serieSelecionada: string = null;

  sortPipe = new SortByPipe();

  blocoVazio: BlocoVazio = {
    id: 'resumo-registros',
    icone: './../../../../assets/img/custom-icons/icone-vazio-periodo-resumo.svg',
    subtitulo: `Nenhum registro <br>adicionado recentemente.`,
    mensagem: `Continue utilizando a nossa plataforma para <br>ter a melhor experiência em nosso dashboard.`,
  };

  ngOnInit(): void {
    this.carregarPeriodo();
    this.carregarDetrans();
    this.carregarEmpresas();

    this.montarGrafico();
  }

  montarGrafico() {
    this.loading = true;
    let start = this.pipe.transform(this.dataInicio, 'yyyy-MM-dd');
    let end = this.pipe.transform(this.dataFim, 'yyyy-MM-dd');
    let ufs = this.filtroForm.get('uf').value || [];
    let empresasId = this.filtroForm.get('empresaId').value;

    this.dashboardService.obterResumoIntervalo(start, end, ufs, empresasId)
      .subscribe({
        next: (interval: string[]) => {
          options.xaxis = {
            type: 'datetime',
            categories: interval,
            labels: {
              formatter: function (val, timestamp) {
                let shortMonths = [
                  'jan',
                  'fev',
                  'mar',
                  'abr',
                  'mai',
                  'jun',
                  'jul',
                  'ago',
                  'set',
                  'out',
                  'nov',
                  'dez',
                ];
                return `${new Date(timestamp).getDate()} ${shortMonths[new Date(timestamp).getMonth()]
                  }`;
              },
            },
          }

          this.dashboardService.obterRegistrosResumo(start, end, ufs, empresasId)
            .subscribe({
              next: (response: ResumoRegistrosResponse) => {
                let records = response.resumoRegistros;
                const result = records.map(record => ({
                  name: record.nome,
                  data: record.valores
                }))

                options.tooltip.custom = ({ series, seriesIndex, dataPointIndex, w }) => {
                  const month = ['janeiro',
                    'fevereiro',
                    'março',
                    'abril',
                    'maio',
                    'junho',
                    'julho',
                    'agosto',
                    'setembro',
                    'outubro',
                    'novembro',
                    'dezembro'];

                  var recordsCount = series[seriesIndex][dataPointIndex]?.toLocaleString();
                  var color = w.config.fill.colors[seriesIndex];
                  var name = w.config.series[seriesIndex].name;
                  var date = interval[dataPointIndex];
                  let titulo = `${date.split('-')[2]} de ${month[+date.split('-')[1] - 1]}`
                  
                  if (name === 'Contratos com pendencia') name = 'Contratos com inconsistências'
                  
                  let htmlTooltipDetails = '';

                  let details = records[seriesIndex].detalhes;

                  if (details.length > 0) {

                    for (let i = 0; i < details.length; i++) {
                      let name = details[i].nome;
                      let count = records[seriesIndex].detalhes[i].valores[dataPointIndex]?.toLocaleString();

                      htmlTooltipDetails +=
                        `<div class='row detalhes'>
                        ${name}
                        <span class='tooltip-value'>${count}</span>
                      </div>`;
                    }
                  }

                  let htmlTooltip = `<div class='tooltip-box resumo'>
                  <label class='bold labels'>
                    ${titulo}
                  </label>
                  <div class='row'>
                    <div>
                      <div class='bullet mr-1' style='background-color: ${color};'></div>
                      ${name}
                    </div>
                    <span class='tooltip-value'>${recordsCount}</span>
                  </div>
                  ${htmlTooltipDetails}
                  </div>`;

                  return htmlTooltip;
                }

                this.objetoGrafico.updateOptions(options);
                this.objetoGrafico.updateSeries(result);
                this.chartOptions = options;
                this.chartOptions.series = result;
                this.loading = false;

              },
              error: err => {
                console.error(err)
                this.chartOptions.series = [];
                this.loading = false;
              }
            })
        },
        error: err => console.error(err)
      });

    var options = {
      series: [],
      chart: {
        height: 350,
        type: 'area',
        fontFamily: 'Montserrat Regular, sans-serif',
        toolbar: { show: false },
        defaultLocale: 'pt-br',
        zoom: {
          enabled: false
        },
        locales: [
          {
            name: 'pt-br',
            options: {
              months: [
                'Janeiro',
                'Fevereiro',
                'Março',
                'Abril',
                'Maio',
                'Junho',
                'Julho',
                'Agosto',
                'Setembro',
                'Outubro',
                'Novembro',
                'Dezembro'
              ],
              shortMonths: [
                'Jan',
                'Fev',
                'Mar',
                'Abr',
                'Maio',
                'Jun',
                'Jul',
                'Ago',
                'Set',
                'Out',
                'Nov',
                'Dez',
              ],
              days: [
                'Domingo',
                'Segunda-feira',
                'Terça-feira',
                'Quarta-feira',
                'Quinta-feira',
                'Sexta-feira',
                'Sábado',
              ],
              shortDays: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
            }
          },
        ]
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 3,
        dashArray: [0, 0, 5],
        colors: ['#9EF19C', '#FFD78A', '#FEA481']
      },
      fill: {
        type: 'gradient',
        colors: ['#9EF19C', '#FFD78A', '#FEA481'],
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.6,
          opacityTo: 0.6,
          stops: [0, 90, 100]
        }
      },
      legend: {
        show: false
      },
      xaxis: {
        type: 'datetime',
        categories: this.intervals,
        labels: {
          formatter: function (val, timestamp) {
            let shortMonths = [
              'Jan',
              'Fev',
              'Mar',
              'Abr',
              'Mai',
              'Jun',
              'Jul',
              'Ago',
              'Set',
              'Out',
              'Nov',
              'Dez',
            ];
            return `${new Date(timestamp).getDate()} ${shortMonths[new Date(timestamp).getMonth()]
              }`;
          },
        },
      },
      markers: {
        hover: {
          size: 9
        },
        colors: ['#9EF19C', '#FFD78A', '#FEA481'],
      },
      tooltip: {
        theme: 'dark',
        shared: true,
        x: {
          format: 'dd - MMMM'
        },
        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
          return ('');
        }
      },
    };

    this.objetoGrafico = new ApexCharts(document.querySelector('#chartLines'), options);
    this.objetoGrafico.render();

    if (this.serieSelecionada) {
      this.mostrarLinhasGrafico(this.serieSelecionada);
    }
  }

  consultarRegistros(tipo: string) {
    const filtroTransacoes: FiltrarTransacoesRequest = <FiltrarTransacoesRequest>{
      DataInicio: this.dataInicio.toString(),
      DataFim: this.dataFim.toString(),
      Ativo: true
    };

    if (tipo === 'success')
      filtroTransacoes.StatusTransacao = [1];
    else if (tipo === 'warning')
      filtroTransacoes.StatusTransacao = [2, 4, 5, 6];
    else{
      filtroTransacoes.StatusTransacao = [1];
      filtroTransacoes.ExisteImagem = false;
    }

    if (this.filtroForm.get('uf').value) { filtroTransacoes.Uf = this.filtroForm.get('uf').value; }
    if (this.filtroForm.get('empresaCnpj').value) { filtroTransacoes.DocumentoCredor = [this.filtroForm.get('empresaCnpj').value]; }

    this.transacaoService.defineFiltroOperacoes(filtroTransacoes);
    this.router.navigate(['/monitor-operacoes-lotes'], { relativeTo: this.activatedRoute, queryParams: { filtroPreDefinido: true } });
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  limparFiltros() {
    this.filtroForm.reset();
    this.selecionarPeriodo(this.periodoInicial);
  }

  selecionaEmpresaId() {
    let empresaSelecionada = this.filtroForm.get('empresaNome').value;
    if (!empresaSelecionada) {
      this.filtroForm.get('empresaId').reset();
      this.filtroForm.get('empresaCnpj').reset();
      return;
    }

    let empresaTxt = this.filtroForm.get('empresaNome').value.split(' - ');
    let cnpj = this.filtroForm.get('empresaNome').value.split(' - ')[empresaTxt.length - 1];

    if (!cnpj) {
      this.filtroForm.get('empresaId').reset();
      this.filtroForm.get('empresaCnpj').reset();
      return;
    }

    let empresaCnpj = this.empresas.filter(e => Utility.checkNumbersOnly(e.cnpj).indexOf(Utility.checkNumbersOnly(cnpj)) > -1)[0];
    if (!empresaCnpj) {
      this.filtroForm.get('empresaId').reset();
      this.filtroForm.get('empresaCnpj').reset();
      return;
    }

    let cnpjEmpresa = this.adicionarZerosEsquerda(Utility.checkNumbersOnly(empresaCnpj.cnpj), 14);
    this.filtroForm.get('empresaCnpj').setValue(cnpjEmpresa);
    this.filtroForm.get('empresaId').setValue(empresaCnpj.id);
  }

  private adicionarZerosEsquerda(num, totalLength) {
    return String(num).padStart(totalLength, '0');
  }


  carregarEmpresas(filtro: string = null) {
    let valueInput = '';

    if (filtro) {
      if (filtro.length >= 3) {
        valueInput = filtro.toLocaleLowerCase()
      }
    }

    this.empresaService.obterEmpresasFiltro(0, 10, valueInput, 'true').subscribe(response => {
      if (response.isSuccessful) {
        this.empresas = response.empresas;
        this.formatarEmpresas(response.empresas);
      }
    })
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

      this.montarGrafico()
      this.emitirFiltros();
    }
  }

  selecionarUf() {
    if (this.todasUFs.selected) {
      this.todasUFs.deselect();
      return false;
    }

    if (this.filtroForm.controls.uf.value.length == this.ufDetrans.length)
      this.todasUFs.select();
  }

  selecionarTodasUfs() {
    if (this.todasUFs.selected) {
      this.filtroForm.controls.uf
        .patchValue([...this.ufDetrans.map(item => item), 'todas']);
    } else {
      this.filtroForm.controls.uf.patchValue(null);
    }
  }

  selecionarPeriodo(dias: number) {
    this.periodoSelecionado = dias;
    this.periodoPadrao = true;

    this.filtroForm.get('dataInicial').reset();
    this.filtroForm.get('dataFinal').reset();
    this.carregarPeriodo();
    this.montarGrafico();
  }

  private formatarEmpresas(empresas: Empresas[]) {
    let empresasLista = empresas;
    empresasLista.forEach(empresa => { empresa.cnpj = Utility.formatCnpj(empresa.cnpj) });
    this.empresasFiltradas = empresasLista;
  }

  private carregarDetrans() {
    this.dominioService.obterPorTipo('UF_DETRAN').subscribe((result) => {
      let ufsOrdenadas = Utility.sortValues(result.valorDominio, 'valor');
      ufsOrdenadas.forEach((uf) => {
        this.ufDetrans.push(uf.valor);
      });
    });
  }

  private carregarPeriodo() {
    this.dataFim = new Date();
    this.dataInicio = new Date();

    this.dataInicio.setDate(this.dataFim.getDate() - this.periodoSelecionado);

    this.emitirFiltros();
  }

  private emitirFiltros() {
    let filtros = <ResumoRegistrosFiltro>{
      periodoPadrao: this.periodoPadrao,
      periodoSelecionado: this.periodoSelecionado,
      dataInicial: this.dataInicio,
      dataFinal: this.dataFim
    }

    if (this.verificarFiltrosPersonalizados()) {
      if (this.filtroForm.get('uf').value) { filtros.ufs = this.filtroForm.get('uf').value; }
      if (this.filtroForm.get('empresaId').value) { filtros.empresasId = [this.filtroForm.get('empresaId').value]; }
    }

    this.filtros.emit(filtros);
  }

  private mostrarLinhasGrafico(serie: string) {
    this.serieSelecionada = serie;

    this.chartOptions?.series.forEach(registros => {
      if (serie === null || registros.name === serie) {
        this.objetoGrafico.showSeries(registros.name);
      }
      else {
        this.objetoGrafico.hideSeries(registros.name);
      }
    });
  }

  private obterLinhaFiltroGrafico(value: 'success' | 'warning' | 'danger') {
    let serie: string = null;

    switch (value) {
      case 'success':
        serie = 'Contratos registrados';
        break;
      case 'warning':
        serie = 'Contratos com pendencia';
        break;
      case 'danger':
        serie = 'Contratos sem imagem';
        break;

      default:
        serie = null;
        break;
    }

    this.mostrarLinhasGrafico(serie);
  }
}
