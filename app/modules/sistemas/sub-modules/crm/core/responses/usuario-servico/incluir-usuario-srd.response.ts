import { BaseResponse } from "src/app/core/responses/base.response";

export class IncluirUsuarioSrdResponse extends BaseResponse {
    ativo: boolean;
    criadoEm: string;
    criadoPor: string;
    email: string;
    emailsRecebemNotificacao: string;
    empresaId: number;
    id: number;
    modificadoEm: string;
    nome: string;
    password: string;
    servico: number;
    sobrenome: string;
    username: string;
}