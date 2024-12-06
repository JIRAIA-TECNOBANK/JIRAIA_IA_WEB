import { BaseResponse } from 'src/app/core/responses/base.response';

export class AtualizarUsuarioEmpresaResponse extends BaseResponse {
  usuarioId: number;
  primeiroNome: string;
  sobrenome: string;
  email: string;
  perfilId: number;
  departamentoId: 0;
  cargoId: 0;
}
