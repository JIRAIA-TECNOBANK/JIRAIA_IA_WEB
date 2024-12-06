import { BaseResponse } from "src/app/core/responses/base.response";

export class BaixarTodosArquivosResponse extends BaseResponse {
    base64: string;
    fileName: string;
}