import { BaseResponse } from "src/app/core/responses/base.response";
import { CobrancaPagador } from "../../models/empresa/cobranca-pagador.model";

export class ObterCobrancaPagadorResponse extends BaseResponse {
    cobrancaPagador: CobrancaPagador;
}