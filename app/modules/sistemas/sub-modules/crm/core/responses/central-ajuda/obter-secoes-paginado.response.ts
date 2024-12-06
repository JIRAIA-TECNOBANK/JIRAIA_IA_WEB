import { BaseResponse } from "src/app/core/responses/base.response";
import { SecoesPaginado } from "../../models/central-ajuda/secoes-paginado";

export class ObterSecoesPaginadoResponse extends BaseResponse {
  listaSecao: SecoesPaginado[];
  pageIndex: number;
  totalItems: number;
}