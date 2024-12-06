import { BaseResponse } from "src/app/core/responses/base.response";

export class CriarPerfilResponse extends BaseResponse {
    nome: string;
    perfilId: number;
}