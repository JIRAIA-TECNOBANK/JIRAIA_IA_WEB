
import { BaseResponse } from "src/app/core/responses/base.response";
import { StatusTransacao } from "../../../../../crm/core/models/transacoes/status-transacoes.model";

export class ObterStatusTransacoesResponse extends BaseResponse {
    statusTransacao: StatusTransacao[] = [];
}