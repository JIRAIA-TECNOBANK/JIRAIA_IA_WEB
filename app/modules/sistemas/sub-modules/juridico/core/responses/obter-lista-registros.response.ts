import { BaseResponse } from "src/app/core/responses/base.response";
import { Registro } from "../model/registro.model";

export class ObterListaRegistrosResponse extends BaseResponse {
    result: {
        totalItems: number;
        registros: Registro[];
    }
}