import { TipoOperacao } from "src/app/modules/sistemas/sub-modules/crm/core/enums/tipo-operacao.enum";

export class TransacaoFaturamento {
    id: number;
    uf: string;
    operacaoId: TipoOperacao;
    ehFaturamento: boolean;
    criadoEm: string;
    modificadoEm: string;
}