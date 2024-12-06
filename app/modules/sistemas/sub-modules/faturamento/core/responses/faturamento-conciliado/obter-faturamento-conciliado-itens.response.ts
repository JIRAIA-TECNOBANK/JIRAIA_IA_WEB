import { BaseResponse } from "src/app/core/responses/base.response";
import { FaturamentoConciliadoItens } from "../../models/faturamento-conciliado/faturamento-conciliado-itens.model";

export class ObterFaturamentoConciliadoItensResponse extends BaseResponse {
    faturamentoConciliadoItens: FaturamentoConciliadoItens;
}