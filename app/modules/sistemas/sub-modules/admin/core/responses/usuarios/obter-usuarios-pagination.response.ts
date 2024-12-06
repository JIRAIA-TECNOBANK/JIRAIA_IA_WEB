import { BaseResponse } from "src/app/core/responses/base.response";
import { Usuario } from "../../models/usuarios/usuarios.model";

export class ObterUsuariosPaginationResponse extends BaseResponse {
    pageIndex: number;
    totalItems: number;
    usuarios: Usuario[];
}