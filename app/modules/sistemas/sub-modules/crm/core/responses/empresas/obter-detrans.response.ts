import { BaseResponse } from "src/app/core/responses/base.response";
import { Detran } from "../../models/empresas/detran.model";

export class ObterDetransResponse extends BaseResponse {
    detrans: Detran[];
}