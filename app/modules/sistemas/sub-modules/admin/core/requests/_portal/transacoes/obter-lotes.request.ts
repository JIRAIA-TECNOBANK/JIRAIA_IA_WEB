export class ObterLotesRequest {
  empresaId: string;
  dominioId: string;
  statusTransacao: string;
  protocoloLote?: string;
  dataInicio?: string;
  dataFim?: string;
  sort?: string;
}