import { BaseResponse } from "src/app/core/responses/base.response";

export class ObterSecaoPorIdResponse extends BaseResponse {
  id: number;
  titulo: string;
  descricao: string;
}