import { BaseResponse } from "src/app/core/responses/base.response";
import { Produtos } from "../../models/produtos/produtos.model";

export class ObterProdutosEmpresaResponse extends BaseResponse {
    produtos: Produtos[];
}