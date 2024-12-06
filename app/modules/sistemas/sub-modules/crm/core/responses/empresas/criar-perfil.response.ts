import { BaseResponse } from 'src/app/core/responses/base.response';

export class CriarPerfilResponse extends BaseResponse {
  perfilId: number;
  nome: string;
}
