import { BaseResponse } from "src/app/core/responses/base.response";
import { RegistrosOperacoes } from "../../models/dashboard/registros-operacoes.model";

export class ObterRegistrosOperacaoResponse extends BaseResponse {
    registrosPorOperacoes: RegistrosOperacoes[];
}