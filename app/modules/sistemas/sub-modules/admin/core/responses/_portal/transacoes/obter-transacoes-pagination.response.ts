import { BaseResponse } from "src/app/core/responses/base.response";
import { Transacoes } from "../../../../../crm/core/models/transacoes/transacoes.model";

export class ObterTransacoesPaginationResponse extends BaseResponse {
  transacoes: Transacoes[] = [];
  totalItems: number;
  habilitaEdicao: boolean;
  habilitaReenvio: boolean;
}