import { BaseResponse } from "src/app/core/responses/base.response";

export class RegistrosConsolidadosResponse extends BaseResponse {
    qtdeContratosRegistrados: number;
    qtdeContratosComInconsistencia: number;
    qtdeContratosInconsistenciaEmAnalise: number;
    qtdeContratosPendenteRevisao: number;
    qtdeContratosSemImagem: number;
    qtdeContratosSemImagemExpirado: number;
    qtdeContratosSemImagemPendente: number;
}