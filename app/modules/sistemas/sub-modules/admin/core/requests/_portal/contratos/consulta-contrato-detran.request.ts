export class ConsultaContratoDetranRequest {
  uf: string;
  chassi: string;
  cnpjAgente: string;
  numContrato: string;
  duda: string;
  remarcacao?: number;
  numGravame?: number;
  tipoGravame?: number;
  mesAno?: string;
  etapa?: string;
  numeroSequencial?: string;
  documentoDevedor?: string;
}