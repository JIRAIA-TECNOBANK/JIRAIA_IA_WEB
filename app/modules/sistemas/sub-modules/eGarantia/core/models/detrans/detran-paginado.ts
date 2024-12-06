export class DetranPaginado {
  id: number;
  uf: string;
  ativo: boolean;
  transacaoSimulada: string;
  criadoEm: string;
  atualizadoEm: string | null;
}

export class DetranFiltro {
  status: string[];
  sigla?: string;
  nome?: string;
  PageIndex?: number;
  PageSize?: number;
}
