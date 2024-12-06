import { BaseResponse } from "src/app/core/responses/base.response";
import { ResumoRegistro } from "../../models/dashboard/resumo-registro.model";

export class ResumoRegistrosResponse extends BaseResponse {
    resumoRegistros: ResumoRegistro[];
}