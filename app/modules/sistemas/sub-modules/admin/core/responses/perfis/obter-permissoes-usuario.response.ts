import { BaseResponse } from "src/app/core/responses/base.response";
import { Permissao } from "../../models/perfis/permissao.model";

export class ObterPerrmissoesUsuarioResponse extends BaseResponse {
  permissoes: Permissao[];
}