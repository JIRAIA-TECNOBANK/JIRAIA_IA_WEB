export interface ArquivoNormativo {
    id: number;
    status: StatusArquivoNormativo;
    nomePortaria: string;
    ehVisaoEstadual: boolean | null;
    tipoPortaria: number | null;
    tipoRegistro: number | null;
    estado: string | null;
    dataVigencia: string | null;
    dtHrCriado: string;
    dtHrModificado: string | null;
}

export enum StatusArquivoNormativo {
    Processando = 0,
    AguardandoAprovacao = 1,
    Aprovado = 2,
    Rejeitado = 3
}