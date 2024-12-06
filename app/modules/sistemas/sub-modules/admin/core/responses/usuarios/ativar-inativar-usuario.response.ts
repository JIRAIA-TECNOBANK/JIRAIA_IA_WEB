import { BaseResponse } from "src/app/core/responses/base.response";

export class AtivarInativarUsuarioResponse extends BaseResponse {
    id: number;
    nome: string;
    usuarioGuid: string;
}