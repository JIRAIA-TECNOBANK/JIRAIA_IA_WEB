import { Empresa } from "../models/relatorios/empresa.model";

export class SolicitarRelatorioRequest {
  nome?: string;
  dominioId: number;
  periodo: number;
  dataInicial: string;
  dataFinal: string;
  tipoArquivo: number;
  empresas: Empresa[];
  todas?: boolean;
}
