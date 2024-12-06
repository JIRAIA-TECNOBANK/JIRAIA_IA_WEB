import { BaseResponse } from "src/app/core/responses/base.response";
import { Registro } from "../model/registro.model";

export class ObterDadosRegistroResponse extends BaseResponse {
    dadosRegistro: Registro[];
}