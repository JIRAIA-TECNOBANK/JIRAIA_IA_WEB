import { BaseResponse } from "src/app/core/responses/base.response";
import { TaxaDetran } from "../../models/taxa/taxa-detran.model";

export class ObterTaxasDetranResponse extends BaseResponse {
    taxasDetran: TaxaDetran[];
}