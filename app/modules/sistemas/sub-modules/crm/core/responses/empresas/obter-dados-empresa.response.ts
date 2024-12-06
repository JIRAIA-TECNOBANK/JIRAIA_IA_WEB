import { BaseResponse } from "src/app/core/responses/base.response";
import { VersaoLote } from "../../models/empresas/versao-lote.model";

export class ObterDadosEmpresaResponse extends BaseResponse {
  id: number;
  nomeFantasia: string;
  cnpj: string;
  razaoSocial: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  tipoEmpresaId: number;
  tipoEmpresa: string;
  comercialResponsavelId: number;
  responsavelComercial: string;
  email: string;
  telefone: string;
  ativo: boolean;
  criadoEm: string;
  modificadoEm: string;
  grupoEconomico: any;
  versoesLote: VersaoLote[];
}