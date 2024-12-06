import { BaseResponse } from "src/app/core/responses/base.response";

export class AlterarPosicaoArtigoResponse extends BaseResponse {
    id: number;
    posicao: number;
    titulo: string;
}