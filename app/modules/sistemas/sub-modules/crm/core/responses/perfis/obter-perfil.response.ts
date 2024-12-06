import { BaseResponse } from "src/app/core/responses/base.response";
import { GrupoPermissoes } from "../../models/grupo-permissoes/grupo-permissoes.model";

export class ObterPerfilResponse extends BaseResponse {
  perfilId: number;
  nome: string;
  descricao: string;
  ativo: boolean;
  convidado?: boolean;
  grupoPermissaoPerfil: GrupoPermissoes;
}