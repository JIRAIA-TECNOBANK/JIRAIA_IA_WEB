import { BaseResponse } from "src/app/core/responses/base.response";

export class AssociarProdutosEmpresaResponse extends BaseResponse {
    produto: string;
    empresa: string;
}