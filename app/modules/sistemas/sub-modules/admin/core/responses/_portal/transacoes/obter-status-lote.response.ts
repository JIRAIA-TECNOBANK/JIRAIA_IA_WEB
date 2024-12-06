import { BaseResponse } from "src/app/core/responses/base.response";
import { StatusLote } from "../../../models/_portal/transacoes/status-lote.model";

export class ObterStatusLoteResponse extends BaseResponse {
  listaStatusLote: StatusLote[];
}