export class TransacoesDetalhes {
    agenteFinanceiro: string;
    tipoDocumento: number;
    documento: string;
    tipoRestricao: number;
    numeroContrato: string;
    gravame: string;
    renavam: string;
    placa: string;
    codigoRetorno?: number;
    descricaoRetorno: string;
    tipoRestricaoDescricao: string;
    existeInconsistencia?: boolean;
    existeImagem?: boolean;
    mensagensInconsistencias: string;
}