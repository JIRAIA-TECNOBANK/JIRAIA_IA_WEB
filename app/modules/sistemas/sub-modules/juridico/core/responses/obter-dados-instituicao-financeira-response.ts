import { BaseResponse } from "src/app/core/responses/base.response";
import { Registro } from "../model/registro.model";

export class ObterDadosInstituicaoFinanceiraResponse extends BaseResponse {
    InstituicaoFinanceira: Registro[] | Registro;
}