import { BaseResponse } from "src/app/core/responses/base.response";
import { ConfigDetrans } from "../../models/configuracoes/config-detrans.model";


export class ObterDetransResponse extends BaseResponse {
    detrans: ConfigDetrans[];
}
