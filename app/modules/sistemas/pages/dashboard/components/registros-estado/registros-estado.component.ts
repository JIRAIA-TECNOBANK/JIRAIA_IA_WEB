import { Component, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { RegistrosPorEstado } from 'src/app/modules/sistemas/core/models/dashboard/registros-por-estado.model';
import { BlocoVazio } from 'src/app/modules/sistemas/core/models/common/bloco-vazio.model';
import { DashboardService } from 'src/app/modules/sistemas/sub-modules/crm/services/dashboard.service';
import { FiltroGraficosComplementares } from 'src/app/modules/sistemas/sub-modules/crm/core/models/dashboard/filtro-graficos-complementares.model';

@Component({
  selector: 'app-registros-estado',
  templateUrl: './registros-estado.component.html',
  styleUrls: ['./registros-estado.component.scss']
})
export class RegistrosEstadoComponent implements OnInit {

  constructor(private dashboardService: DashboardService) { }

  @Input('filtro') filtro: FiltroGraficosComplementares;

  ufs = [
    { nome: 'Acre', sigla: 'AC', regiao: 'Norte' },
    { nome: 'Alagoas', sigla: 'AL', regiao: 'Nordeste' },
    { nome: 'Amapá', sigla: 'AP', regiao: 'Norte' },
    { nome: 'Amazonas', sigla: 'AM', regiao: 'Norte' },
    { nome: 'Bahia', sigla: 'BA', regiao: 'Nordeste' },
    { nome: 'Ceará', sigla: 'CE', regiao: 'Nordeste' },
    { nome: 'Distrito Federal', sigla: 'DF', regiao: 'CentroOeste' },
    { nome: 'Espírito Santo', sigla: 'ES', regiao: 'Sudeste' },
    { nome: 'Goiás', sigla: 'GO', regiao: 'CentroOeste' },
    { nome: 'Maranhão', sigla: 'MA', regiao: 'Nordeste' },
    { nome: 'Mato Grosso', sigla: 'MT', regiao: 'CentroOeste' },
    { nome: 'Mato Grosso do Sul', sigla: 'MS', regiao: 'CentroOeste' },
    { nome: 'Minas Gerais', sigla: 'MG', regiao: 'Sudeste' },
    { nome: 'Pará', sigla: 'PA', regiao: 'Norte' },
    { nome: 'Paraíba', sigla: 'PB', regiao: 'Nordeste' },
    { nome: 'Paraná', sigla: 'PR', regiao: 'Sul' },
    { nome: 'Pernambuco', sigla: 'PE', regiao: 'Nordeste' },
    { nome: 'Piauí', sigla: 'PI', regiao: 'Nordeste' },
    { nome: 'Rio de Janeiro', sigla: 'RJ', regiao: 'Sudeste' },
    { nome: 'Rio Grande do Norte', sigla: 'RN', regiao: 'Nordeste' },
    { nome: 'Rio Grande do Sul', sigla: 'RS', regiao: 'Sul' },
    { nome: 'Rondônia', sigla: 'RO', regiao: 'Norte' },
    { nome: 'Roraima', sigla: 'RR', regiao: 'Norte' },
    { nome: 'Santa Catarina', sigla: 'SC', regiao: 'Sul' },
    { nome: 'São Paulo', sigla: 'SP', regiao: 'Sudeste' },
    { nome: 'Sergipe', sigla: 'SE', regiao: 'Nordeste' },
    { nome: 'Tocantins', sigla: 'TO', regiao: 'Nordeste' },
  ];
  estados: RegistrosPorEstado[] = [];

  blocoVazio: BlocoVazio = {
    id: 'registros-estado',
    titulo: 'Registros por estado',
    icone: './../../../../assets/img/custom-icons/icone-vazio-estado.svg',
    subtitulo: `Nenhum registro <br>adicionado recentemente.`,
    mensagem: `Continue utilizando a nossa plataforma para <br>ter a melhor experiência em nosso dashboard.`,
  };

  loading: boolean = true;

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.carregarDadosGrafico();
  }

  carregarDadosGrafico() {
    this.loading = true;
    this.estados = [];

    this.dashboardService
      .obterRegistrosPorEstado(this.filtro.dataInicio, this.filtro.dataFim)
      .subscribe((response) => {

        if (response.operacoesPorEstado) {
          let registros = response.operacoesPorEstado;

          for (let i = 0; i < this.ufs.length; i++) {
            for (let j = 0; j < registros.length; j++) {
              if (this.ufs[i].sigla == registros[j].uf) {
                registros[j].estado = this.ufs[i].nome;
                registros[j].regiao = this.ufs[i].regiao;
              }
            }
          }

          this.estados = registros;

          if (registros.length > 0) {
            this.removeGrafico(registros);
            return;
          }
        }

        this.loading = false;
      });
  }

  private removeGrafico(registros) {
    var svg = d3
      .select('#chart')
      .attr('width', '0')

    var circles = svg.selectAll("circle")
      .data(<RegistrosPorEstado[]>[], function (d) {
        return null
      });

    let texts = svg.selectAll("text")

    texts.attr('opacity', 0)

    circles.exit()
      .remove();

    this.montarGrafico(registros);
    this.loading = false;
  }

  private montarGrafico(data) {
    const width = 400;
    const height = 400;
    const colors = {
      Nordeste: '#FF6B6B',
      Sul: '#1DD1A1',
      Sudeste: '#1666AE',
      Norte: '#B6E10A',
      CentroOeste: '#AE1656',
    };

    const bubble = (data) =>
      d3.pack().size([width, height]).padding(3)(
        d3.hierarchy({ children: data }).sum((d) => d.total)
      );

    const svg = d3
      .select('#chart')
      .attr('font-size', '12px')
      .attr('font-family', 'Montserrat Bold')
      .attr("viewBox", "0 0 400 400")
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('style', 'display: inline; height: 80%; width: 100%;')
      .attr("text-anchor", "middle")

    const root = bubble(data);
    const tooltip = d3.select('.tooltip');

    const node = svg
      .selectAll()
      .data(root.children)
      .enter()
      .append('g')

    const circle = node
      .append('circle')
      .style('fill', (d) => colors[d.data.regiao])
      .style('opacity', '0.5')
      .style('transition-duration', '.5s')
      .attr('r', (d) => d.r)
      .on('mouseover', function (e, d) {
        tooltip.select('.tooltip-uf').text(d.data.estado);
        tooltip.select('.registros-pill').text(d.data.total.toLocaleString());
        tooltip.style('visibility', 'visible');

        d3.select(this).style('opacity', '0.6');
      })
      .on('mousemove', (e) => {
        tooltip
          .style('top', `${e.offsetY + 10}px`)
          .style('left', `${e.offsetX + 50}px`)
      }
      )
      .on('mouseout', function () {
        d3.select(this).style('opacity', '0.5');
        return tooltip.style('visibility', 'hidden');
      });

    function selectTextColor(regiao) {
      if (regiao == 'Sudeste' || regiao == 'CentroOeste') {
        return '#FFF';
      } else {
        return '#384047';
      }
    }

    const label = node
      .append('text')
      .text((d) => d.data.uf)
      .attr(
        'style',
        (d) =>
          'font-weight: bold; cursor: default; pointer-events: none;' +
          'fill: ' +
          selectTextColor(d.data.regiao)
      )
      .attr("y", 3)
      .on('mouseover', function (e, d) {
        tooltip.select('.tooltip-uf').text(d.data.estado);
        tooltip.select('.registros-pill').text(d.data.total.toLocaleString());
        tooltip.style('visibility', 'visible');
      })
      .on('mousemove', (e) =>
        tooltip
          .style('top', `${e.offsetY + 10}px`)
          .style('left', `${e.offsetX + 10}px`)
      )
      .on('mouseout', function () {
        d3.select(this).style('stroke', 'none');
        return tooltip.style('visibility', 'hidden');
      });

    node
      .transition()
      .ease(d3.easeExpInOut)
      .duration(1000)
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`);

    circle.transition().ease(d3.easeExpInOut).duration(1000);

    label
      .transition()
      .delay(700)
      .ease(d3.easeExpInOut)
      .duration(1000)
      .style('opacity', 1);

    svg.attr('width', 400)
  }
}
