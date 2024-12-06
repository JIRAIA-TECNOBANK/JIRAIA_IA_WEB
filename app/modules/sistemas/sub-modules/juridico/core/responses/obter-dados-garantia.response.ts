import { BaseResponse } from "src/app/core/responses/base.response";
import { Registro } from "../model/registro.model";

export class ObterDadosGarantiaResponse extends BaseResponse {
    dadosGarantia: Registro[];
}