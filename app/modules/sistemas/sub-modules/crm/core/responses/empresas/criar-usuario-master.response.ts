import { BaseResponse } from "src/app/core/responses/base.response";

export class CriarUsuarioMasterResponse extends BaseResponse {
  nome: string;
  usuarioGuid: string;
}
