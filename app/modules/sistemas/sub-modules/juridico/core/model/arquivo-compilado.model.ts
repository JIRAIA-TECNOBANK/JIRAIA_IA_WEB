export interface ArquivoCompilado {
    nome: string
    status: number
    dtHrCriado: string
    dtHrModificado: string
}

export enum StatusArquivoCompilado {
    AguardandoProcessamento = 0,
    Processando = 1,
    ProcessadoComSucesso = 2,
    ProcessadoComErro = 3
}