import { BaseResponse } from "src/app/core/responses/base.response";
import { UsuarioApi } from "../../models/usuarios-empresa/usuario-api.model";

export class ObterUsuarioApiResponse extends BaseResponse {
  usuariosApi: UsuarioApi[];
}