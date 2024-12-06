import { TaxaDetran } from "./taxa-detran.model";

export class Contrato {
    numeroContrato: string;
    numeroRestricao: number;
    tipoRestricao: number;
    ufLicenciamento: string;
    dataContrato: string;
    numeroAditivo: string;
    dataAditivo: string;
    tipoAditivo?: number;
    protocolo?: string;
    numeroSequencial?: string;
    taxaDetran: TaxaDetran;

    constructor() {
        this.taxaDetran = new TaxaDetran();
    }
}