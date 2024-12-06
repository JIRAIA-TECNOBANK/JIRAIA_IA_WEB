import { BaseResponse } from "src/app/core/responses/base.response";
import { Enderecos } from "../../models/empresas/enderecos.model";

export class ObterEmpresasEnderecoPrincipalResponse extends BaseResponse {
    id: number;
    enderecoPrincipal: boolean;
    endereco: Enderecos;
}