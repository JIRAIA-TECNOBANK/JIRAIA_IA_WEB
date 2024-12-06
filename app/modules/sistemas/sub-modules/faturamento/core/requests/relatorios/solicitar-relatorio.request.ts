import { TipoArquivoRelatorioFaturamento } from "../../enums/tipo-arquivo-relatorio-faturamento.enum";
import { TipoFormatoRelatorioFaturamento } from "../../enums/tipo-formato-relatorio-faturamento.enum";
import { TipoModeloRelatorioFaturamento } from "../../enums/tipo-modelo-relatorio-faturamento.enum";

export class SolicitarRelatorioRequest {
    empresaId: number;
    modelo: TipoModeloRelatorioFaturamento;
    uf: string;
    formato: TipoFormatoRelatorioFaturamento;
    usuarioId: number;
    tipoArquivo: TipoArquivoRelatorioFaturamento;
    dataReferencia: Date;
}