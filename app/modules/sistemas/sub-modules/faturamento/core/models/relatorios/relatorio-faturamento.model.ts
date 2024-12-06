import { TipoArquivoRelatorioFaturamento } from "../../enums/tipo-arquivo-relatorio-faturamento.enum";
import { TipoFormatoRelatorioFaturamento } from "../../enums/tipo-formato-relatorio-faturamento.enum";
import { TipoModeloRelatorioFaturamento } from "../../enums/tipo-modelo-relatorio-faturamento.enum";
import { TipoStatusRelatorioFaturamento } from "../../enums/tipo-status-relatorio-faturamento.enum";

export class RelatorioFaturamento {
    empresaId: number;
    nomeFantasia?: string;
    modelo: TipoModeloRelatorioFaturamento;
    uf: string;
    formato: TipoFormatoRelatorioFaturamento;
    periodoRelatorio: Date;
    usuarioId: number;
    primeiroNomeUsuario: string;
    sobreNomeUsuario: string;
    status: TipoStatusRelatorioFaturamento;
    tipoArquivoRelatorio: TipoArquivoRelatorioFaturamento;
    url: string;
    criadoEm: Date;
}