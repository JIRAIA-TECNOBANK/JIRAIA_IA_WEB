import { Documento } from "src/app/modules/sistemas/core/models/documento.model";

export class ContratoComplementar {
    taxaContrato?: number;
    taxaIof?: number;
    indice: string;
    indicadorTaxaMora: boolean;
    valorTaxaMora?: number;
    indicadorTaxaMulta: boolean;
    valorTaxaMulta?: number;
    taxaJurosMes?: number;
    taxaJurosAno?: number;
    indicadorComissao: boolean;
    comissao?: number;
    indicadorPenalidade: boolean;
    penalidade: string;
    nomeRecebedorPagamento: string;
    documentoRecebedor: Documento;
    documentoVendedor: Documento;
    comentario?: string;

    constructor() {
        this.documentoRecebedor = new Documento();
        this.documentoVendedor = new Documento();
    }
}
