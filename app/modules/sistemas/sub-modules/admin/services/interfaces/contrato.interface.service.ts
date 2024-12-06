import { ConsultarContratoResponse } from "../../core/responses/_portal/contrato/consultar-contrato.response";

export interface IContratoService {
  retornoContrato(contrato: ConsultarContratoResponse): void;
  retornoProtocolo(protocoloOrigem: string): void;
}
