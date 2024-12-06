import { BaseResponse } from "src/app/core/responses/base.response";
import { TaxaDetranOperacao } from "../../models/taxa/taxa-detran-operacao.model";

export class EditarTaxaDetranResponse extends BaseResponse {
    criadoPor: string;
    dataInicioVigencia: string;
    dataTerminoVigencia: string;
    id: number;
    operacoes: TaxaDetranOperacao[];
    renovacaoAutomatica: boolean;
    uf: string;
}