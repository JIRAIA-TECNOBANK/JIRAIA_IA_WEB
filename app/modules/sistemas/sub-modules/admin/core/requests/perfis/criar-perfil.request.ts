import { GrupoPermissoes } from "../../models/perfis/grupo-permissoes.model";

export class CriarPerfilRequest {
    nome: string;
    descricao: string;
    grupoPermissaoPerfil: GrupoPermissoes;
}