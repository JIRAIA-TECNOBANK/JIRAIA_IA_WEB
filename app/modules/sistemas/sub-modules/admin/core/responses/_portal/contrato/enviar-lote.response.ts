import { BaseResponse } from "src/app/core/responses/base.response";

export class EnviarLoteResponse extends BaseResponse {
    status: string;
    dataTransacao: string;
    protocoloLote: string;
}