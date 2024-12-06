import { BaseResponse } from "src/app/core/responses/base.response";
import { SolicitacaoRelatorioItem } from "../../models/relatorios/solicitacao-relatorio-item.model";

export class ObterRelatorioFinanceiroPaginadoResponse extends BaseResponse {
    solicitacaoRelatorios: SolicitacaoRelatorioItem;
}