import { TipoOperacao } from "../../../../crm/core/enums/tipo-operacao.enum";

export class TaxaDetranOperacao {
    ativo: boolean;
    operacaoId: TipoOperacao;
    valorTaxa: number;
}