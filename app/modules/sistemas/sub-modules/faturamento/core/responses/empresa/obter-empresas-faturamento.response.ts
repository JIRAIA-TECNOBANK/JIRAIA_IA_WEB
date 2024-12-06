import { BaseResponse } from "src/app/core/responses/base.response";
import { EmpresasItems } from "../../models/empresa/empresas-items.mode";

export class ObterEmpresasFaturamentoResponse extends BaseResponse {
    empresas: EmpresasItems;
}