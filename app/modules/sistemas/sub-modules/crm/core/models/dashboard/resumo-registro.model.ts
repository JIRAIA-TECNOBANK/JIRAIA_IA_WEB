import { BaseResponse } from "src/app/core/responses/base.response";
import { ResumoRegistroDetalhe } from "./resumo-registro-detalhe.model";

export interface ResumoRegistro extends BaseResponse {
    nome: string;
    valores: number[];
    detalhes: ResumoRegistroDetalhe[];
}