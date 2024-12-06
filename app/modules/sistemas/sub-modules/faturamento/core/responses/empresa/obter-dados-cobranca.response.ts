import { BaseResponse } from "src/app/core/responses/base.response";
import { Cobranca } from "../../models/empresa/cobranca.model";

export class ObterDadosCobrancaResponse extends BaseResponse {
    cobranca: Cobranca;
}