import { BaseResponse } from "src/app/core/responses/base.response";

export class TransacoesResponse extends BaseResponse {
    login: string;
    uf: string;
    chassi: string;
    statusTransacao: string;
    tipoOperacao: string;
    numeroContrato: string;
    criadaEm: string;
    existeInconsistencia: boolean;
}