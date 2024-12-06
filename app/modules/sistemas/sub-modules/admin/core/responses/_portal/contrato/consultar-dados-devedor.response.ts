import { BaseResponse } from "src/app/core/responses/base.response";
import { Devedor } from "../../../models/_portal/contratos/devedor.model";

export class ConsultarDadosDevedorResponse extends BaseResponse {
    devedor: Devedor;
}