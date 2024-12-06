import { BaseResponse } from "src/app/core/responses/base.response";
import { Area } from "../../models/areas/areas.model";

export class ObterAreasResponse extends BaseResponse {
    areas: Area[];
}