import { BaseResponse } from "src/app/core/responses/base.response";
import { TableAprovarCancelamentoNFND } from "../../models/gestao-aprovacoes/table-aprovar-cancelamento-nf-nd.model";

export class ObterTableCancelamentoNotasResponse extends BaseResponse {
    aprovacoes: TableAprovarCancelamentoNFND;
}