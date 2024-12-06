import { BaseResponse } from "src/app/core/responses/base.response";
import { TopInconsistencias } from "../../models/dashboard/top-inconsistencias.model";

export class ObterTopInconsistenciasResponse extends BaseResponse {
    topInconsistencias: TopInconsistencias[];
}