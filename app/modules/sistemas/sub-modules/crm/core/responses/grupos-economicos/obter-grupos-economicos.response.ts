import { BaseResponse } from "src/app/core/responses/base.response";
import { GruposEconomicos } from "../../models/grupos-economicos/grupos-economicos.model";

export class ObterGruposEconomicosResponse extends BaseResponse {
    pageIndex: number;
    totalItems: number;
    gruposEconomicos: GruposEconomicos[];
}