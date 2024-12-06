import { BaseResponse } from "src/app/core/responses/base.response";
import { RegistrosPorEstado } from "../../../../../core/models/dashboard/registros-por-estado.model";

export class ObterRegistrosPorEstadoResponse extends BaseResponse {
    registros: RegistrosPorEstado[];
}