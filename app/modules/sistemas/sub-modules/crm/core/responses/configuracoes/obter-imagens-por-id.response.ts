import { BaseResponse } from "src/app/core/responses/base.response";

export class ObterImagensPorIdResponse extends BaseResponse {
  id: number;
  dominioId: string;
  tamanhoArquivoTbk: string;
  tamanhoArquivoDetran: string;
  tipoArquivoTbk: string;
  tipoArquivoDetran: string;
  envioDetran: string;
  converteExtensao: string;
  converteTamanho: string;
}
