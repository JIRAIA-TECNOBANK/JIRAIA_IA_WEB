import { BaseResponse } from "src/app/core/responses/base.response";
import { Veiculo } from "../../../models/_portal/contratos/veiculo.model";

export class ConsultarContratoVeiculoResponse extends BaseResponse {
    veiculo: Veiculo
}
