import { BaseResponse } from "src/app/core/responses/base.response";
import { TransacaoFaturamento } from "../../../models/_portal/transacoes/transacao-faturamento.model";

export class ObterFlagsElegiveisFaturamentoResponse extends BaseResponse {
    transacaoFaturamento: TransacaoFaturamento[];
}