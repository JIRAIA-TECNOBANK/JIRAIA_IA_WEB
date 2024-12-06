import { BaseResponse } from "src/app/core/responses/base.response";
import { VersaoLote } from "../../models/empresas/versao-lote.model";
import { GruposEconomicos } from "../../models/grupos-economicos/grupos-economicos.model";

export class ObterEmpresaResponse extends BaseResponse {
  id: number;
  nomeFantasia: string;
  cnpj: string;
  razaoSocial: string;
  ativo: boolean;
  grupoEconomico: GruposEconomicos;
  comercialResponsavelId: number;
  criadoEm: Date;
  email: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  modificadoEm?: Date;
  responsavelComercial: string;
  telefone: string;
  tipoEmpresa: string;
  tipoEmpresaId: number;
  versoesLote: VersaoLote[];
  cadastroOriginadoContran?: boolean;
}