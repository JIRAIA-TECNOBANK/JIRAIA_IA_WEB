import { BaseResponse } from "src/app/core/responses/base.response";
import { Contatos } from "../../models/empresas/contato.model";

export class AtualizarEmpresaContatoResponse extends BaseResponse {
  contato: Contatos;
  empresaId: number;
}
