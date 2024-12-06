import { Permissao } from "src/app/modules/sistemas/sub-modules/admin/core/models/perfis/permissao.model";

export class PermissoesSistema {
    private static permissoes: Permissao[] = [];
    private static nomeUsuario: string;

    static setarPermissoesSistema(permissoes: Permissao[]) {
        PermissoesSistema.permissoes = permissoes;
    }

    static get retornarPermissoesSistema() {
        return PermissoesSistema.permissoes;
    }

    static setarNomeUsuario(nomeUsuario: string) {
        PermissoesSistema.nomeUsuario = nomeUsuario;
    }

    static get retornarNomeUsuario() {
        return PermissoesSistema.nomeUsuario;
    }
}