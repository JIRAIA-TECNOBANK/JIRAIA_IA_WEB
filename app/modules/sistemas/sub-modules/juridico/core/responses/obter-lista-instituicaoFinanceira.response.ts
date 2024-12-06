import { BaseResponse } from "src/app/core/responses/base.response";
import { Instituicao } from "../model/instituicao-financeira.model";

export class ObterListaInstituicaoFinanceiraResponse extends BaseResponse {
    result: {
        totalItems: number;
        instituicoesFinanceiras: Instituicao[];
    }
}