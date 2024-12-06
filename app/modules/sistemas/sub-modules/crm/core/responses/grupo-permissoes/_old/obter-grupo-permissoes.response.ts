import { BaseResponse } from "src/app/core/responses/base.response";
import { _oldGrupo } from "../../../models/perfis/grupo.model";

export class _OldObterGrupoPermissoesResponse extends BaseResponse {
  grupos: _oldGrupo[];
}
