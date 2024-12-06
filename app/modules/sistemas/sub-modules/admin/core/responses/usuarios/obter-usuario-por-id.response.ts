import { BaseResponse } from "src/app/core/responses/base.response";

export class ObterUsuarioPorIdResponse extends BaseResponse {
  id:number;
  usuarioGuid: string;
  primeiroNome: string;
  sobrenome: string;
  email: string;
  documento: string;
  telefone: string;
  areaId: number;
  perfilId: number;
  ativo: boolean;
}
