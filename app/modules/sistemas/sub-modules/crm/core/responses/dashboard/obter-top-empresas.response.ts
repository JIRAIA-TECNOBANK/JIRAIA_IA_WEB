import { BaseResponse } from "src/app/core/responses/base.response";
import { TopEmpresas } from "../../models/dashboard/top-empresas.model";

export class ObterTopEmpresasResponse extends BaseResponse {
    topEmpresas: TopEmpresas[];
}