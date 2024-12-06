import { BaseResponse } from "src/app/core/responses/base.response";

export class DeleteEnderecoResponse extends BaseResponse {
    empresaId: number;
    enderecoId: number;
}
