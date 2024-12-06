import { BaseResponse } from "src/app/core/responses/base.response";

export class ObterDudaPorIdResponse extends BaseResponse {
    id: number;
    cnpj: string;
    estoque: number;
    // loteMensal: number;
    // compraMinima: number;
    // qtdLotePadrao: number;
    // qtdGuiaDisponivel: number;
    // ultimaCompra: string;
    // qtdComprasAutomatica: number;
    // ativo: boolean;
}
