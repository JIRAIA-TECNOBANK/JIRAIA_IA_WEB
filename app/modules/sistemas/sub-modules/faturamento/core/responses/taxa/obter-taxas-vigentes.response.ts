import { BaseResponse } from "src/app/core/responses/base.response";
import { Taxas } from "../../models/taxa/taxas.model";

export class ObterTaxasVigentesResponse extends BaseResponse {
    taxas: Taxas[];
}