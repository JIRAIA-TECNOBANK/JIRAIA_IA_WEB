import { BaseResponse } from "src/app/core/responses/base.response";

export class ObterDocumentoPorGuidResponse extends BaseResponse {
  nomeArquivo: string;
  tamanhoByte: number;
  documentoBase64: string;
}
