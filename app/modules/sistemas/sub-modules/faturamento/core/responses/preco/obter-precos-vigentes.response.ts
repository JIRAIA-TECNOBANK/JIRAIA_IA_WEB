import { BaseResponse } from "src/app/core/responses/base.response";
import { PrecoTbk } from "../../models/preco/preco-tbk.model";

export class ObterPrecosVigentesResponse extends BaseResponse {
    precoTecnobank: PrecoTbk[];
}