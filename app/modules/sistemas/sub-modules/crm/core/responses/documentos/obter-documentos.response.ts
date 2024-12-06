import { BaseResponse } from "src/app/core/responses/base.response";
import { Arquivos } from "../../models/arquivos/arquivos.model";

export class ObterDocumentosResponse extends BaseResponse {
  documentos: Arquivos[];
}
