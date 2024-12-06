import { _oldGrupo } from "../../../models/perfis/grupo.model";

export class _oldCriarPerfilRequest {
  empresaId: number;
  nome: string;
  descricao: string;
  ativo: boolean;
  grupoPermissoes: _oldGrupo[];
}
