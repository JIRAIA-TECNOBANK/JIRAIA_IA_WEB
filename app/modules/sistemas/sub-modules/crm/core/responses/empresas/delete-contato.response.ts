import { BaseResponse } from "src/app/core/responses/base.response";

export class DeleteContatoResponse extends BaseResponse {
    empresaId: number;
    contatoId: number;
}
