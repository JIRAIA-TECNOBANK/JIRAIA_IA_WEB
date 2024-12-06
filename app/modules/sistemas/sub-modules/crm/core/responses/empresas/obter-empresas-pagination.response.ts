import { BaseResponse } from "src/app/core/responses/base.response"
import { Empresas } from "../../models/empresas/empresas.model";

export class ObterEmpresasPaginationResponse extends BaseResponse {
    pageIndex: number;
    totalItems: number;
    empresas: Empresas[];
}