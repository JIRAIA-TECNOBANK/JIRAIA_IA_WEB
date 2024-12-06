import { BaseResponse } from "src/app/core/responses/base.response";

export class ObterLoteResponse extends BaseResponse {
  usuarioId: string;
  protocolo: string;
  dominioId: number;
  operacaoId: null;
  nomeArquivo: string;
  url: string;
  totalLinhas: number;
  statusLoteId: number;
  empresaId: number;
  criadoEm: string;
  modificadoEm: string;
}