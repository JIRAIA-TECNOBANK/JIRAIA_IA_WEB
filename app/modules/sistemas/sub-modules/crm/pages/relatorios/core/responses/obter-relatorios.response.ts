
import { BaseResponse } from "src/app/core/responses/base.response";
import { Relatorios } from "../models/relatorios/relatorios-model";

export class ObterRelatoriosResponse extends BaseResponse {
  totalItems: number;
  relatorios: Relatorios[];
}
