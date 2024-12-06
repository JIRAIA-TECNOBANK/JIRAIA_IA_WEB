import { BaseResponse } from 'src/app/core/responses/base.response';
import { Especie } from '../../models/veiculos/especie.model';

export class ObterEspecieResponse extends BaseResponse {
  pageIndex: number;
  totalItems: number;
  especies: Especie[];
}