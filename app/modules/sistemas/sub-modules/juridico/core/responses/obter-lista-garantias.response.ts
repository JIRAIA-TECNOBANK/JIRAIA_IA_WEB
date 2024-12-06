import { BaseResponse } from "src/app/core/responses/base.response";
import { Registro } from "../model/registro.model";

export class ObterListaGarantiasResponse extends BaseResponse {
    result: {
        totalItems: number;
        garantias: Registro[];
    }
}