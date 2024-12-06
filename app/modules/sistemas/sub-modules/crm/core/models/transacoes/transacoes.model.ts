export class Transacoes {
    login: string;
    uf: string;
    chassi: string;
    statusTransacao: string;
    tipoOperacao: string;
    numeroContrato: string;
    criadaEm: string;
    protocolo: string;
    existeInconsistencia: boolean;
    ehFrota?: boolean;
    baixadoCancelado?: string;
    habilitaCheckbox?: boolean;
    documento?: string;
    nomeStatusTransacao?: string;
    idStatusTransacao?: number;
    ehReprocessamento?: boolean;
}