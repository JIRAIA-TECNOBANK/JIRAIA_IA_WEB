import { BaseResponse } from "src/app/core/responses/base.response";
import { Produtos } from "../../models/produtos/produtos.model";
import { ParametrizaDudas } from "../../models/taxas/parametriza-dudas.model";

export class ObterDudasPaginationResponse extends BaseResponse {
    pageIndex: number;
    totalItems: number;
    parametrizaDudas: ParametrizaDudas[];
}
