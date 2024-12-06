export class ConciliacaoItem {
    id: number;
    dataContrato?: Date;
    dataRegistro?: Date;
    uf: string;
    empresaNome: string;
    chassi: string;
    gravame: string;
    canal: string;
    operacao: string;
    numeroContrato: string;
    protocoloId: string;
    valorNotaFiscal?: number;
    valorNotaDebito?: number;
    motivo: string;
    faturamentoConciliadoId?: number;
    statusFaturamentoConciliadoId?: number;
    status: string;
}