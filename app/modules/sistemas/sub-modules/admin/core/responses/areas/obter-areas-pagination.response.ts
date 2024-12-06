import { BaseResponse } from "src/app/core/responses/base.response";
import { Area } from "../../models/areas/areas.model";

export class ObterAreasPaginationResponse extends BaseResponse {
    pageIndex: number;
    totalItems: number;
    areas: Area[];
}