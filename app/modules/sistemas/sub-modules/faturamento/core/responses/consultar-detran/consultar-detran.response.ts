import { BaseResponse } from "src/app/core/responses/base.response";
import { DetranPagamentos } from "../../models/consultar-detran/detran-pagamentos.model";

export class ConsultarDetranResponse extends BaseResponse {
    detranPagamentosResponse: DetranPagamentos;
}