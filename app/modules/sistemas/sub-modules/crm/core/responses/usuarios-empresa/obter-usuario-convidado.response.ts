import { BaseResponse } from "src/app/core/responses/base.response";

export class ObterUsuarioConvidadoResponse extends BaseResponse {
  usuarioId: number;
  nomeUsuario: string;
  email: string
  tipoExterno: boolean;
  nomeEmpresaOrigem: string;
  empresaIdOrigem: number;
  perfilId: number;
  nomeEmpresaConvidado: string;
  empresaIdConvidado: number;
  ativo: boolean;
  cnpj: string;
}