import { BaseResponse } from 'src/app/core/responses/base.response';

export class EditarDescontoResponse extends BaseResponse {
  descontoId: number;
  success?: boolean;
  message?: string;
}
