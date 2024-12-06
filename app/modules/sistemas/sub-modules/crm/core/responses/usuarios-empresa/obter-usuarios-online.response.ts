import { BaseResponse } from "src/app/core/responses/base.response";
import { UsuariosOnline } from "../../models/usuarios-empresa/usuarios-online.model";

export class ObterUsuariosOnlineResponse extends BaseResponse {
  usuarios: UsuariosOnline[];
}