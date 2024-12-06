import { BaseResponse } from "src/app/core/responses/base.response";
import { _oldGrupo } from "../../../models/perfis/grupo.model";

export class _oldObterPerfilResponse extends BaseResponse {
  id: number;
  empresaId: number;
  nome: string;
  descricao: string;
  ativo: boolean;
  grupos: _oldGrupo[];
}