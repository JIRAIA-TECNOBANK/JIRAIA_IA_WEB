import { BaseResponse } from "src/app/core/responses/base.response";
import { DetalhamentoCompra } from "../../models/taxas/detalhamento-compra-duda.model";

export class ObterDetalhamentoDudaResponse extends BaseResponse {
    pageIndex: number;
    totalItems: number;
    nomeEmpresa: string;
    cnpjEmpresa: string
    detalhamentoDudas: DetalhamentoCompra[];
}
