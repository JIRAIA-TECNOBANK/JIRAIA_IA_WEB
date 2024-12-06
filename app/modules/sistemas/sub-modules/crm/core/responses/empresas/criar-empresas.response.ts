import { BaseResponse } from "src/app/core/responses/base.response";

export class CriarEmpresasResponse extends BaseResponse {
    empresaId: number;
    nomeFantasia: string;
}