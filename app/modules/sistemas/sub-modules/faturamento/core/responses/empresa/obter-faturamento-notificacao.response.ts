import { BaseResponse } from "src/app/core/responses/base.response";
import { FaturamentoNotificacao } from "../../models/empresa/faturamento-notificacao.model";

export class ObterFaturamentoNotificacaoResponse extends BaseResponse {
    cobrancaNotificacao: FaturamentoNotificacao;
}