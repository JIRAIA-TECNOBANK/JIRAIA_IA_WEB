export enum TipoStatusTransacao {
    Iniciada = 1,
    AguardandoValidacao = 2,
    ValidacaoConcluidaComInconsistencia = 3,
    ValidacaoConcluidaComSucesso = 4,
    IniciadoProcessamento = 5,
    FalhaNoProcessamento = 6,
    ProcessamentoConcluido = 7
}