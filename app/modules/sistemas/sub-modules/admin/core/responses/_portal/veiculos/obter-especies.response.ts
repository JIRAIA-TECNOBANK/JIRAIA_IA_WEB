import { BaseResponse } from "src/app/core/responses/base.response";
import { Especie } from "../../../../../crm/core/models/veiculos/especie.model";

export class ObterEspeciesResponse extends BaseResponse {
    especies: Especie[] = [];
}
