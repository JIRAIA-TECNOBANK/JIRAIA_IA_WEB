import { BaseResponse } from "src/app/core/responses/base.response";
import { DetranPaginado } from "../../models/detrans/detran-paginado";

export class ObterDetransPaginationResponse extends BaseResponse {
  items: DetranPaginado[];
  pageIndex: number;
  totalItems: number;
}