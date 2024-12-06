import { TipoStatusRelatorioFaturamento } from "../enums/tipo-status-relatorio-faturamento.enum";

export const TipoStatusRelatorioFaturamentoDesc = new Map<number, string>([
    [TipoStatusRelatorioFaturamento.Solicitado, 'Solicitado'],
    [TipoStatusRelatorioFaturamento.EmProcessamento, 'Em processamento'],
    [TipoStatusRelatorioFaturamento.Processado, 'Processado'],
    [TipoStatusRelatorioFaturamento.ErroProcessamento, 'Erro processamento']
]);