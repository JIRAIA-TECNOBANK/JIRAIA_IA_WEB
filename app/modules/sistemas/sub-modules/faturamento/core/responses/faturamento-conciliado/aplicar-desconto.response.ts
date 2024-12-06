import { BaseResponse } from "src/app/core/responses/base.response";

export class AplicarDescontoResponse extends BaseResponse {
    descontoId: number;
    success?: boolean;
    message?: string;
}