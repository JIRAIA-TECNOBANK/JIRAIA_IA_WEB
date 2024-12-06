import { ConciliacaoItem } from "./conciliacao-item.model";
import { ConciliadoStatus } from "./conciliado-status.model";
import { StatusProtheus } from "./status-protheus.model";

export class TableConciliacao {
    id: number;
    cnpj: string;
    empresa: string;
    clienteId: number;
    uf: string;
    mesCompetencia: Date;
    quantidadeOperacoes: number;
    quantidadeReembolsar: number;
    operacoesReembolsar: number;
    valorNotaFiscal: number;
    valorNotaDebito: number;
    statusFaturamentoConciliadoId: number;
    statusEtapaId: number;
    statusEtapa?: number;
    faturamentoConciliadoItems?: ConciliacaoItem[];
    statusFaturamentoConciliado: ConciliadoStatus;
    statusProtheus: StatusProtheus[];
    criadoEm: Date;
    modificadoEm: Date;
    valorDescontoNf?: number;
    valorDescontoNd?: number;
    aprovar: boolean;
    notaDebito: string;
    notaFiscal: string;
    descontoId?: number;
    isConciliadoForaPrazo?: boolean;
    reenviarFaturar?: boolean;
}