import { BaseResponse } from "src/app/core/responses/base.response";
import { Grupo } from "../../models/perfis/grupo.model";

export class ObterGruposPermissoesResponse extends BaseResponse {
  grupoPermissoes: Grupo[];
}