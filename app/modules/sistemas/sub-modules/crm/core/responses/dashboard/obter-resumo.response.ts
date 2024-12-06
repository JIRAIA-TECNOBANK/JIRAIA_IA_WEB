import { BaseResponse } from "src/app/core/responses/base.response";
import { RegistrosResumo } from "../../../../../core/models/dashboard/registros-resumo.model";

export class ObterResumoResponse extends BaseResponse {
    registrosResumo: RegistrosResumo[];
}