import { BaseResponse } from "src/app/core/responses/base.response";
import { UsuariosGrupoEconomico } from "../../models/usuarios-empresa/usuarios-grupo-economico.model";

export class ObterGrupoEconomicoUsuariosResponse extends BaseResponse {
  usuariosConvidados: UsuariosGrupoEconomico[];
}