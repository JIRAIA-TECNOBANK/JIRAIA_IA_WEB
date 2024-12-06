export class Registro {
  id: number;
  uf: string;
  valorPublico: string;
  valorPrivado: string;
  tipoRegistro: string;
  criadoEm: string;
  modificadoEm: string;
  observacao: string;
  valorTotal?: string;
  documentos?: Array<Documento>;
  result: any;
}

export interface Documento{
  id: number;
  documento: string;
}