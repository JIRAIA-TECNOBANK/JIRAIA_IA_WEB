import { BaseResponse } from "src/app/core/responses/base.response";
import { AplicacaoPaginado } from "../../models/aplicacoes/aplicacoes-paginado";

export class ObterAplicacoesPaginationResponse extends BaseResponse {
  items: AplicacaoPaginado[];
  pageIndex: number;
  totalItems: number;
}