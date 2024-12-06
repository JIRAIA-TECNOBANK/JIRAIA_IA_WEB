import { BaseResponse } from "src/app/core/responses/base.response";
import { Perfil } from "../../models/perfis/perfil.model";

export class ObterPerfisPaginationResponse extends BaseResponse {
  pageIndex: number;
  totalItems: number;
  perfis: Perfil[];
}
