import { BaseResponse } from "src/app/core/responses/base.response";
import { RegistrosPorUF } from "../../models/dashboard/registros-por-uf.model";

export class ObterRegistrosSucessoResponse extends BaseResponse {
    registrosComSucessos: RegistrosPorUF[];
}