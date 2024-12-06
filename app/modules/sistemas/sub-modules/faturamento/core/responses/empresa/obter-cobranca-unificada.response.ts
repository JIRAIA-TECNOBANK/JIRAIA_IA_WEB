import { BaseResponse } from "src/app/core/responses/base.response";
import { CobrancaUnificada } from "../../models/empresa/cobranca-unificada.model";

export class ObterCobrancaUnificadaResponse extends BaseResponse {
    cobrancaUnificada?: CobrancaUnificada;
}