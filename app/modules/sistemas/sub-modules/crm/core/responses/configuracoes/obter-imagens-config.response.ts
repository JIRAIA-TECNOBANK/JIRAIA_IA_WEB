import { BaseResponse } from "src/app/core/responses/base.response"
import { ConfigImagem } from "../../models/configuracoes/configImagem.model";

export class ObterConfigImagensResponse extends BaseResponse {
    pageIndex: number;
    totalItems: number;
    imagens: ConfigImagem[];
}
