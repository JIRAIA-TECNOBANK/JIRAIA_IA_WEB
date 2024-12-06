import { BaseResponse } from "src/app/core/responses/base.response";

export class ResetarSenhaUsuarioResponse extends BaseResponse {
    id: number;
    nome: string;
    usuarioGuid: string;
}