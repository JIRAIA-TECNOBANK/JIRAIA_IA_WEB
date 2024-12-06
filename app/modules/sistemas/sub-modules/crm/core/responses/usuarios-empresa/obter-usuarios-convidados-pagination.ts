import { BaseResponse } from "src/app/core/responses/base.response";
import { UsuariosConvidados } from "../../models/usuarios-empresa/usuarios-convidados";

export class ObterUsuariosConvidadosPaginationResponse extends BaseResponse {
  totalItems: number;
  usuarios: UsuariosConvidados[];
}