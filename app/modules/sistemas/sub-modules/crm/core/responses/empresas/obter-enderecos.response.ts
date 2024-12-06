import { BaseResponse } from "src/app/core/responses/base.response";
import { Enderecos } from "../../models/empresas/enderecos.model";

export class ObterEnderecosResponse extends BaseResponse {
    pageIndex: number;
    totalItems: number;
    enderecos: EnderecosResponse[];
}

export class EnderecosResponse {
    id: number;
    enderecoPrincipal: boolean;
    endereco: Enderecos;
}