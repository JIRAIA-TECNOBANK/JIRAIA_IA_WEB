import { TaxaDetranOperacao } from "./taxa-detran-operacao.model";

export class TaxaDetran {
    id?: number;
    dataInicioVigencia: string;
    dataTerminoVigencia: Date;
    status: string;
    criadoPor: string;
    ativo: boolean;
    criadoEm: string;
    operacoes: TaxaDetranOperacao[];
}