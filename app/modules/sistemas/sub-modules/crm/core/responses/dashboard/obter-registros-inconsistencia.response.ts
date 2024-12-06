import { BaseResponse } from "src/app/core/responses/base.response";
import { RegistrosPorUF } from "../../models/dashboard/registros-por-uf.model";

export class ObterRegistrosInconsistenciaResponse extends BaseResponse {
    registrosComInconsistencias: RegistrosPorUF[];
}