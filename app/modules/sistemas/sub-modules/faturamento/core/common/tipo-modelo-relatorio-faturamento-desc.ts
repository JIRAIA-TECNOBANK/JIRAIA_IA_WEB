import { TipoModeloRelatorioFaturamento } from "../enums/tipo-modelo-relatorio-faturamento.enum";

export const TipoModeloRelatorioFaturamentoDesc = new Map<number, string>([
    [TipoModeloRelatorioFaturamento.Fechamento, 'Fechamento'],
    [TipoModeloRelatorioFaturamento.PreviaFaturamento, 'Prévia de Fechamento'],
    [TipoModeloRelatorioFaturamento.OperacoesContabilizadasPrejuizo, 'Operações com cobrança excluída'],
    [TipoModeloRelatorioFaturamento.Historico, 'Histórico Taxas DETRAN e Preços Tecnobank'],
    [TipoModeloRelatorioFaturamento.PrecosPrivados, 'Preços privados - Agentes financeiros'],
    [TipoModeloRelatorioFaturamento.OperacoesCobradas, 'Quantitativo de operações cobradas'],
    [TipoModeloRelatorioFaturamento.FechamentoDetrans, 'Fechamento DETRANs'],
    [TipoModeloRelatorioFaturamento.DescontosNFND, 'Descontos concedidos NF/ND']
]);