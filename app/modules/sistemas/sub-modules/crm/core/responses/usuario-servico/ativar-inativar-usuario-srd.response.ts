import { BaseResponse } from "src/app/core/responses/base.response";

export class AtivarInativarUsuarioSrdResponse extends BaseResponse {
    id: number;
    empresaId: number;
    username: string;
    password: string;
    nome: string;
    sobrenome: string;
    email: string;
    ativo: boolean;
    servico: number;
    emailsRecebemNotificacao: string;
    criadoEm: string;
    criadoPor: string;
    modificadoEm: string;
}