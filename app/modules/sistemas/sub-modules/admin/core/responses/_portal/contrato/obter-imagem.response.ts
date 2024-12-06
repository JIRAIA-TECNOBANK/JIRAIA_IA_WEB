import { BaseResponse } from "src/app/core/responses/base.response";
import { ImagemResponse } from "./imagem.response";

export class ObterImagemResponse extends BaseResponse {
    existeImagem: boolean;
    imagem: ImagemResponse;
    erro: string;
    success: boolean;
}