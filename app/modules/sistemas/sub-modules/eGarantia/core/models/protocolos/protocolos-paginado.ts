export class ProtocoloPaginado {
  id: number;
  nome: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string | null;
  transacoes: any[];
}

export class ProtocoloFiltro {
  status: string[];
  sigla?: string;
  nome?: string;
  PageIndex?: number;
  PageSize?: number;
  eGarantiaNumeroProtocolo: null;
  nsu: any;
  numeroContrato: null;
  aplicacaoNome: null;
}
