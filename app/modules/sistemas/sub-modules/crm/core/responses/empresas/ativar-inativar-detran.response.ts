import { BaseResponse } from "src/app/core/responses/base.response";

export class AtivarInativarDetranResponse extends BaseResponse {
    empresaId: number;
    detranId: number;
    ativo: boolean;
}