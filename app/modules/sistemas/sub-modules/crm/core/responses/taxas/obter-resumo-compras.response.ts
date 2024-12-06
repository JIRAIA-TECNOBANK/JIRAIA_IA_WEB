import { BaseResponse } from "src/app/core/responses/base.response";
import { DetalhesCompra } from "../../models/taxas/detalhamento-compra-duda.model";

export class ObterDetalhesDudaResponse extends BaseResponse {
    detalhes: DetalhesCompra[];
}
