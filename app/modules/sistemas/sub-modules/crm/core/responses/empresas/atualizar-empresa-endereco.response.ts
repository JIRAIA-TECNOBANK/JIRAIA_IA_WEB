import { BaseResponse } from "src/app/core/responses/base.response";
import { Enderecos } from "../../models/empresas/enderecos.model";

export class AtualizarEmpresaEnderecoResponse extends BaseResponse {
  endereco: Enderecos;
  enderecoPrincipal: boolean;
  empresaId: number;
}
