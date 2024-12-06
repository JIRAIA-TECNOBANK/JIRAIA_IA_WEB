import { LiberacaoCredito } from "./liberacao-credito.model";
import { Consorcio } from "./consorcio.model";

export class Financiamento {
    valorTotalDivida: number;
    valorParcela: number;
    quantidadeParcela: number;
    dataVencimentoPrimeiraParcela: string;
    dataVencimentoUltimaParcela: string;
    idMunicipio: number;
    liberacaoCredito: LiberacaoCredito;
    consorcio: Consorcio;

    constructor() {
        this.liberacaoCredito = new LiberacaoCredito();
        this.consorcio = new Consorcio();
    }
}