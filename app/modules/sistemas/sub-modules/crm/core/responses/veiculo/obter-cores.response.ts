import { BaseResponse } from 'src/app/core/responses/base.response';
import { Cor } from '../../models/veiculos/cor.model';

export class ObterCoresResponse extends BaseResponse {
  pageIndex: number;
  totalItems: number;
  cores: Cor[];
}
