import { BaseResponse } from "src/app/core/responses/base.response";

export class EmitirRelatorioEmailResponse extends BaseResponse {
    protocolo: string;
    emails: string[];
}