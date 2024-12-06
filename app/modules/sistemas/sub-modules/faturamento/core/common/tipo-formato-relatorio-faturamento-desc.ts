import { TipoFormatoRelatorioFaturamento } from "../enums/tipo-formato-relatorio-faturamento.enum";

export const TipoFormatoRelatorioFaturamentoDesc = new Map<number, string>([
    [TipoFormatoRelatorioFaturamento.Analitico, 'Analítico'],
    [TipoFormatoRelatorioFaturamento.Sintetico, 'Sintético']
]);