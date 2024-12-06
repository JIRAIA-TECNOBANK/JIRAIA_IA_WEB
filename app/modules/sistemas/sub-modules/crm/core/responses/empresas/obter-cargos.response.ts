import { BaseResponse } from "src/app/core/responses/base.response"
import { Cargos } from "../../models/empresas/cargos.model";

export class ObterCargosEmpresaResponse extends BaseResponse {
   cargos: Cargos[];
}