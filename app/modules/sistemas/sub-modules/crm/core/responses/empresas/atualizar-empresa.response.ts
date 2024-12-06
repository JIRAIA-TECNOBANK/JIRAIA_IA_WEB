import { BaseResponse } from "src/app/core/responses/base.response";

export class AtualizarEmpresaResponse extends BaseResponse {
    empresaId: number;
    nomeFantasia: string;
    razaoSocial: string;
}