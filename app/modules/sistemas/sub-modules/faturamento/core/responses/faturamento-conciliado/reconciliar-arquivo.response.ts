import { BaseResponse } from "src/app/core/responses/base.response";

export class ReconciliarArquivoResponse extends BaseResponse {
    flag: boolean;
    msg: string;
}