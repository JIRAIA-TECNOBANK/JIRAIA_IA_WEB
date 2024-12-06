import { BaseResponse } from "src/app/core/responses/base.response";
import { CobrancaVencimento } from "../../models/empresa/cobranca-vencimento.model";

export class ObterCobrancaVencimentoResponse extends BaseResponse {
    cobrancaVencimento: CobrancaVencimento;
}