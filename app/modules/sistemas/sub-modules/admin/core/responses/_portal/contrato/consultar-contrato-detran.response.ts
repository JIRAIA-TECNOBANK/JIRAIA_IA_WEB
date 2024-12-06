import { BaseResponse } from "src/app/core/responses/base.response";
import { RetornoContratoDetran } from "../../../models/_portal/contratos/retorno-contrato-detran.model";

export class ConsultarContratoDetranResponse extends BaseResponse {
  retorno: RetornoContratoDetran;
}