import { BaseResponse } from "src/app/core/responses/base.response";

export class EmitirEmailResponse extends BaseResponse {
    success: boolean;
    msg: string;
}