import { BaseResponse } from "src/app/core/responses/base.response";

export class CriarDepartamentoResponse extends BaseResponse {
    departamentoId: number;
    nome: string;
}