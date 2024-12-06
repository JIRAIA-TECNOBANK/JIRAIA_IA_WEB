import { BaseResponse } from "src/app/core/responses/base.response";
import { Dominios } from "../../models/dominios/dominios.model";

export class DominiosResponse extends BaseResponse {
    tipoDominio: string;
    valorDominio: Dominios[];
}