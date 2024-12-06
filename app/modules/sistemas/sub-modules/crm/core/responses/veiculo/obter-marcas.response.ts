import { BaseResponse } from 'src/app/core/responses/base.response';
import { Marcas } from '../../models/veiculos/marcas.model';

export class ObterMarcasResponse extends BaseResponse {
  pageIndex: number;
  totalItems: number;
  marcas: Marcas[];
}
