import { GrupoPermissoes } from "../../models/grupo-permissoes/grupo-permissoes.model";

export class CriarPerfilRequest {
  empresaId: number;
  nome: string;
  descricao: string;
  convidado: boolean;
  grupoPermissaoPerfil: GrupoPermissoes;
}