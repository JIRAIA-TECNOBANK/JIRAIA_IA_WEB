import { BaseResponse } from "src/app/core/responses/base.response";
import { Grupo } from "../../models/grupo-permissoes/grupo.model";

export class ObterGrupoPermissoesResponse extends BaseResponse {
  grupoPermissoes: Grupo[];
}