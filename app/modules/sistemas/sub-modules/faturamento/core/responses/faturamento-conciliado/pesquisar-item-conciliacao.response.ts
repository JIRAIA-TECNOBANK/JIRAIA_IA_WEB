import { BaseResponse } from "src/app/core/responses/base.response";
import { ConciliacaoItem } from "../../models/faturamento-conciliado/conciliacao-item.model";

export class PesquisarItemConciliacaoResponse extends BaseResponse {
    faturamentoConciliadoItens: ConciliacaoItem[];
}