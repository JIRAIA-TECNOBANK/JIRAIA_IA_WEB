import { BaseResponse } from "src/app/core/responses/base.response";
import { Detrans } from "../../models/conexao-detrans/detrans.model";

export class MapaDetransResponse extends BaseResponse {
  detrans: Detrans[]
  percentualConectado: number;
}
