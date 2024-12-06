import { BaseResponse } from "src/app/core/responses/base.response";
import { TableAprovarCestaServico } from "../../models/gestao-aprovacoes/table-aprovar-cesta-servico.model";

export class ObterTableAprovacaoCestaServico extends BaseResponse {
    aprovacoes: TableAprovarCestaServico;
}