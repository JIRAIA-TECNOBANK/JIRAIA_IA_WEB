import { BaseResponse } from "src/app/core/responses/base.response";
import { Usuario } from "../../models/usuarios/usuarios.model";

export class ObterListaUsuariosIdsResponse extends BaseResponse {
    usuarios: Usuario[];
}