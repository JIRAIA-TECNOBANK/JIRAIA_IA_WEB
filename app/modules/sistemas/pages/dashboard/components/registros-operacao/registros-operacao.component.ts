import { Component, Input } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { BlocoVazio } from 'src/app/modules/sistemas/core/models/common/bloco-vazio.model';
import { TipoOperacao } from 'src/app/modules/sistemas/sub-modules/crm/core/enums/tipo-operacao.enum';
import { FiltroGraficosComplementares } from 'src/app/modules/sistemas/sub-modules/crm/core/models/dashboard/filtro-graficos-complementares.model';
import { RegistrosOperacoes } from 'src/app/modules/sistemas/sub-modules/crm/core/models/dashboard/registros-operacoes.model';
import { DashboardService } from 'src/app/modules/sistemas/sub-modules/crm/services/dashboard.service';

@Component({
  selector: 'app-registros-operacao',
  templateUrl: './registros-operacao.component.html',
  styleUrls: ['./registros-operacao.component.scss']
})
export class RegistrosOperacaoComponent {

  @Input('filtro') filtro: FiltroGraficosComplementares;

  registrosOperacoes: RegistrosOperacoes[] = [];
  maiorValor = 100;
  loading: boolean = true;

  blocoVazio: BlocoVazio = {
    id: 'registros-operacoes',
    titulo: 'Registros por operação',
    icone: './../../../../assets/img/custom-icons/icone-vazio-lapis.svg',
    subtitulo: `Nenhuma operação <br>adicionada recentemente.`,
    mensagem: `Continue utilizando a nossa plataforma para <br>ter a melhor experiência em nosso dashboard.`,
  };

  constructor(private dashboardService: DashboardService) { }

  ngOnChanges() {
    this.carregarDadosGrafico();
  }

  private carregarDadosGrafico() {
    this.loading = true;
    this.registrosOperacoes = [];

    this.dashboardService.obterRegistrosPorOperacao(this.filtro.dataInicio, this.filtro.dataFim).subscribe(response => {
      if (response.registrosPorOperacoes?.length > 0) {
        this.registrosOperacoes = this.ordenarOperacoes(response.registrosPorOperacoes);
        this.calcularTotalMaior();
      }

      this.loading = false;
    });
  }

  private ordenarOperacoes(registrosOperacoes: RegistrosOperacoes[]): RegistrosOperacoes[] {
    return [
      registrosOperacoes.filter(o => o.tipoOperacao === 1)[0] || this.retornarOperacaoZerada(TipoOperacao.RegistrarContrato),
      registrosOperacoes.filter(o => o.tipoOperacao === 2)[0] || this.retornarOperacaoZerada(TipoOperacao.AlterarContrato),
      registrosOperacoes.filter(o => o.tipoOperacao === 3)[0] || this.retornarOperacaoZerada(TipoOperacao.RegistrarAditivo),
      registrosOperacoes.filter(o => o.tipoOperacao === 4)[0] || this.retornarOperacaoZerada(TipoOperacao.AlterarAditivo),
    ];
  }

  private retornarOperacaoZerada(operacao: TipoOperacao) {
    return <RegistrosOperacoes>{
      tipoOperacao: operacao,
      total: 0,
      totalSucesso: 0,
      totalInconsistencia: 0
    };
  }

  retornarTipoOperacao(tipoOperacao: number): string {
    if (tipoOperacao === 1) {
      return 'Registro de contrato';
    }

    if (tipoOperacao === 2) {
      return 'Alteração de contrato';
    }

    if (tipoOperacao === 3) {
      return 'Registro de aditivo';
    }

    if (tipoOperacao === 4) {
      return 'Alteração de aditivo';
    }
  }

  calcularPorcentagemRegistros(registros: number): number {
    if (registros === 0) return null;
    return (registros * 100) / this.maiorValor;
  }

  private calcularTotalMaior(): void {
    let listTotal = this.registrosOperacoes.map(rp => rp.total);
    let maior = 0;

    listTotal.forEach(t => {
      if (t > maior) maior = t;
    });

    this.maiorValor = maior;
  }
}
