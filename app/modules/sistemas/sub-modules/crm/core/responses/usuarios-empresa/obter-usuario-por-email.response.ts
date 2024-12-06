import { BaseResponse } from "src/app/core/responses/base.response";
import { EmpresaRetornoEmail } from "../../models/usuarios-empresa/empresa-retorno-email.model";

export class ObterUsuarioPorEmailResponse extends BaseResponse {
  id: number;
  usuarioGuid: string;
  primeiroNome: string;
  sobrenome: string;
  nomeCompleto: string;
  documento: string;
  email: string;
  telefone: string;
  telefones?: string[];
  ramal: string;
  recebeComunicados?: boolean;
  ativo?: boolean;
  criadoEm: string;
  empresa?: EmpresaRetornoEmail;
  mensagemModal: string;
}