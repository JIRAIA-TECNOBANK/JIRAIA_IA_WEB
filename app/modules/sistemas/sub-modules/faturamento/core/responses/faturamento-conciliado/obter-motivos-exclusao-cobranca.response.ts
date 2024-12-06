import { BaseResponse } from "src/app/core/responses/base.response";
import { MotivoExclusaoCobranca } from "../../models/faturamento-conciliado/motivo-exclusao-cobranca.model";

export class ObterMotivosExclusaoCobrancaResponse extends BaseResponse {
    motivoExclusao: MotivoExclusaoCobranca[];
}