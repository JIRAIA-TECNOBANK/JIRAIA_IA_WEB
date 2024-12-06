export class AplicarDescontoRequest {
    faturamentoConciliadoId: number;
    mesReferencia: Date;
    valorDescontoNf: number;
    valorDescontoNd: number;
    areaResponsavel: string;
    email: string;
    motivoNf: string;
    motivoNd: string;
    comentarioNf: string;
    comentarioNd: string;
}