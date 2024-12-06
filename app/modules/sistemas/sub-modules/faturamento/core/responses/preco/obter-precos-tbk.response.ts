import { BaseResponse } from "src/app/core/responses/base.response";
import { PrecoTbk } from "../../models/preco/preco-tbk.model";

export class ObterPrecosTbkResponse extends BaseResponse {
    precoTecnobank: PrecoTbk[];
}