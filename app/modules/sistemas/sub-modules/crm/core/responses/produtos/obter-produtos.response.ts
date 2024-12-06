import { BaseResponse } from "src/app/core/responses/base.response";
import { Produtos } from "../../models/produtos/produtos.model";

export class ObterProdutosResponse extends BaseResponse {
    pageIndex: number;
    totalItems: number;
    produtos: Produtos[];
}