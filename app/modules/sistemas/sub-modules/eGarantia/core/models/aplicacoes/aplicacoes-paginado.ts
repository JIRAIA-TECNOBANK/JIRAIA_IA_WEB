export class AplicacaoPaginado {
  id: number;
  nome: string;
  callbackUrl:string;
  callbackSecretKey:string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string | null;
}

export class AplicacaoFiltro {
  status: string[];
  sigla?: string;
  nome?: string;
  PageIndex?: number;
  PageSize?: number;
}
