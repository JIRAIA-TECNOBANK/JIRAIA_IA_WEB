import { ResumoRegistrosDadosDetalhe } from "./resumo-registros-dados-detalhe.model";

export class BotaoFiltroResumo {
    id: string;
    tipo: 'success' | 'warning' | 'danger';
    icone: string;
    titulo: string;
    total: number;
    porcentagem: string;
    tooltip: string;
    consulta?: boolean;
    detalheRegistros?: ResumoRegistrosDadosDetalhe[];
}