import { _oldPermissao } from "./permissao.model";

export class _oldGrupo {
  id: number;
  nome: string;
  permissoes: _oldPermissao[];
  expanded?: boolean;
}