import { TaxaDetranOperacao } from "../../models/taxa/taxa-detran-operacao.model";

export class CriarTaxaDetranRequest {
    uf: string;
    criadoPor: string;
    dataInicioVigencia: string;
    dataTerminoVigencia: string;
    renovacaoAutomatica: boolean = false;
    operacoes: TaxaDetranOperacao[];
}