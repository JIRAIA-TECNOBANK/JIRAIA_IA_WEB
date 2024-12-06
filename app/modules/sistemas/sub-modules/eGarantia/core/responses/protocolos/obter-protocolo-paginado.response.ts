import { BaseResponse } from "src/app/core/responses/base.response";
import { ProtocoloPaginado } from "../../models/protocolos/protocolos-paginado";

export class ObterProtocolosPaginationResponse extends BaseResponse {
  items: ProtocoloPaginado[];
  pageIndex: number;
  totalItems: number;
}