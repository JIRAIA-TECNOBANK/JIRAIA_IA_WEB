import { BaseResponse } from 'src/app/core/responses/base.response';
import { Desconto } from '../../models/faturamento-conciliado/desconto.model';

export class ObterDescontoCadastradoResponse extends BaseResponse {
	desconto: Desconto;
}
