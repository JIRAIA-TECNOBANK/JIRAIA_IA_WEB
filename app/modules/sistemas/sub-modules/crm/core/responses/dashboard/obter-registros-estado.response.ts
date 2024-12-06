import { BaseResponse } from "src/app/core/responses/base.response";
import { RegistrosPorEstado } from "src/app/modules/sistemas/core/models/dashboard/registros-por-estado.model";

export class ObterRegistrosEstadoResponse extends BaseResponse {
    operacoesPorEstado: RegistrosPorEstado[];
}