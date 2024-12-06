import { BaseResponse } from 'src/app/core/responses/base.response';
import { Modelo } from '../../models/veiculos/modelo.model';

export class ObterModelosResponse extends BaseResponse {
  pageIndex: number;
  totalItems: number;
  modelos: Modelo[];
}
