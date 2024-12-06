import { BaseResponse } from "src/app/core/responses/base.response";

export class AtivarInativarUsuarioApiResponse extends BaseResponse {
  id: number;
  ativo: boolean;
}