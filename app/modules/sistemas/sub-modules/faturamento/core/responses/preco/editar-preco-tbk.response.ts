import { BaseResponse } from "src/app/core/responses/base.response";
import { TaxaDetranOperacao } from "../../models/taxa/taxa-detran-operacao.model";

export class EditarPrecoTbkResponse extends BaseResponse {
    criadoPor: string;
    dataInicioVigencia: string;
    dataTerminoVigencia: string;
    id: number;
    operacoes: TaxaDetranOperacao[];
    renovacaoAutomatica: boolean;
    tipoPreco: number;
    uf: string;
}