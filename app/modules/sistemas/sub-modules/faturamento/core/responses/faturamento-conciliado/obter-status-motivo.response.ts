import { BaseResponse } from "src/app/core/responses/base.response";
import { StatusMotivo } from "../../models/faturamento-conciliado/status-motivo.model";

export class ObterStatusMotivoResponse extends BaseResponse {
    statusMotivo: StatusMotivo[];
}