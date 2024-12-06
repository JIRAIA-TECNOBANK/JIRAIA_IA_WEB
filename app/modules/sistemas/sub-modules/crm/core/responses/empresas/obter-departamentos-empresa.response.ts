import { BaseResponse } from "src/app/core/responses/base.response"
import { Departamentos } from "../../models/empresas/departamentos.model"

export class ObterDepartamentosEmpresaResponse extends BaseResponse {
   departamentos: Departamentos[];
}