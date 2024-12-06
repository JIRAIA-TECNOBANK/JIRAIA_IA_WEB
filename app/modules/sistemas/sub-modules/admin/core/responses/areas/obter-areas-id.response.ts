import { BaseResponse } from "src/app/core/responses/base.response";

export class ObterAreasIdResponse extends BaseResponse {
    id?: number;
    areaId?: number;
    nome?: string;
    descricao?: string;
    email?: string;
    modificadoEm?: string;
    criadoEm?: string;
    ativo?: boolean;
}