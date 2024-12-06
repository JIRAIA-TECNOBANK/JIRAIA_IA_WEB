export interface Normativo {
  id: number;
  idUf: number;
  uf: string;
  nomePortaria: string;
  nomeArquivo: string;
  dataVigencia: string;
  criadoEm: string;
  tipoNormativo: string;
  tipoRegistro: string;
  ehVisaoNacional: string;
  status: string;
}

export class FiltroNormativos {
  id: number;
  uf: string[];
  nomePortaria: string;
  nomeArquivo: string;
  dataInicioVigencia: string;
  dataFimVigencia: string;
  dataInicioCriacao: string;
  dataFimCriacao: string;
  status: string[];
  tipoRegistro: string[];
  tipo: string[];
  visaoNacional: boolean;
}

export class TipoNormativo {
  nome: string;
  descricao: string;
  criandoEm: string;
  id: number
}

export class responseApiTipoNormativo {
  code: number;
  result: {
    tiposNormativo: TipoNormativo[];
  };
  isSuccessful: boolean;
  errors: any;
  timeGenerated: string;
  copyright: string;
}