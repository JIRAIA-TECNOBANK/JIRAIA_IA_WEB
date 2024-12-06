import { BaseResponse } from "src/app/core/responses/base.response";
import { ArtigosListagem } from "../../models/central-ajuda/artigos-listagem";

export class ObterArtigosPorSecaoResponse extends BaseResponse {
    artigos: ArtigosListagem[];
}