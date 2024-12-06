import { TipoFormatoRelatorioFaturamento } from "../../enums/tipo-formato-relatorio-faturamento.enum";
import { TipoModeloRelatorioFaturamento } from "../../enums/tipo-modelo-relatorio-faturamento.enum";

export class FiltroRelatoriosFaturamento {
    empresasId: number[];
    modelos?: TipoModeloRelatorioFaturamento[];
    formatos?: TipoFormatoRelatorioFaturamento[];
    status?: number[];
    ufs?: string[];
    dataReferencia?: string;
}