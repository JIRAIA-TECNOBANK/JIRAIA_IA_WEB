import { BaseResponse } from "src/app/core/responses/base.response";
import { Uf } from "../../models/geograficos/uf.model";

export class UfsResponse extends BaseResponse {
    ufs: Uf[];
}