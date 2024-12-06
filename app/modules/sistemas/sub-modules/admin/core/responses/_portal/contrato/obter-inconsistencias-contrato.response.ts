import { BaseResponse } from "src/app/core/responses/base.response";
import { MensagemInconsistenciaContrato } from "../../../models/_portal/inconsistencias-contrato/mensagem-inconsistencia-contrato.model";

export class InconsistenciasContratoResponse extends BaseResponse {
    inconsistenciasContrato: MensagemInconsistenciaContrato[];
}