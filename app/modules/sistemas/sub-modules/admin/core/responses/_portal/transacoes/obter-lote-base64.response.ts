import { BaseResponse } from "src/app/core/responses/base.response";

export class ObterLoteBase64Response extends BaseResponse {
  loteBase64: string;
  nomeArquivo: string;
}