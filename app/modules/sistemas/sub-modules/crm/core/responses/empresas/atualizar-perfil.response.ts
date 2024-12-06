import { BaseResponse } from 'src/app/core/responses/base.response';

export class AtualizarPerfilResponse extends BaseResponse {
  nome: string;
  descricao: string;
  ativo:boolean;
}
