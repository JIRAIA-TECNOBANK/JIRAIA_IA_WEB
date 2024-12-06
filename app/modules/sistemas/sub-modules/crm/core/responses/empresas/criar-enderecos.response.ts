import { BaseResponse } from "src/app/core/responses/base.response";
import { Enderecos } from "../../models/empresas/enderecos.model";

export class CriarEnderecosResponse extends BaseResponse {
    endereco: Enderecos;
    enderecoPrincipal: boolean;
    empresaId: number;
}