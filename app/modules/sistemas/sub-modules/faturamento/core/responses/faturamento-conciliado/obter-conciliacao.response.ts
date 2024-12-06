import { BaseResponse } from "src/app/core/responses/base.response";
import { FaturamentoConciliado } from "../../models/faturamento-conciliado/faturamento-conciliado.model";

export class ObterConciliacaoResponse extends BaseResponse {
    faturamentoConciliados: FaturamentoConciliado;
}