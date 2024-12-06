import { _oldPerfis } from "../empresas/_old/perfis.model";

export class UsuarioEmpresa {
    id: number;
    perfil: _oldPerfis;
    usuarioGuid: string;
    primeiroNome: string;
    sobrenome: string;
    nomeCompleto: string;
    email: string;
    emailCorporativo: string;
    ativo: boolean;
    recebeComunicados: boolean;
    criadoEm: string;
    modificadoEm: string;
    notificaFaturamento?: boolean;
}
