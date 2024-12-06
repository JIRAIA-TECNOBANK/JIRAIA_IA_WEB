export class AprovacaoNota {
    id: number;
    empresa: string;
    empresaId: number;
    uf: string;
    mesCompetencia: Date;
    valorNotaFiscal: number;
    valorNotaDebito: number;
    valorDescontoNf: number;
    valorDescontoNd: number;
    solicitadoPor: string;
    documentoCancelado: string;
    aprovadoPor: string;
    status: string;
}