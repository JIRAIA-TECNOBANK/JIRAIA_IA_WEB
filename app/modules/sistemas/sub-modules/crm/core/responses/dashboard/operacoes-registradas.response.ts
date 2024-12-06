import { BaseResponse } from "src/app/core/responses/base.response";
import { OperacoesRegistradas } from "src/app/modules/sistemas/sub-modules/crm/core/models/dashboard/operacoes-registradas.model";

export class OperacoesRegistradasResponse extends BaseResponse {
    operacoesRegistradas: OperacoesRegistradas[];
}