export class DetalhamentoCompra {
    numeroSolicitacao: string;
    dataInclusao: string;
    total: number;
    totalEnviar: number;
    totalErro: number;
    totalEnviado: number;
    totalPago: number;
    compraAutomatica: boolean;
    justificativa: string;
}

export class DetalhesCompra {
    numeroDuda: string;
    codigoBarras: string;
    dataPagamento: string;
    valor: string;
    status: string;
}