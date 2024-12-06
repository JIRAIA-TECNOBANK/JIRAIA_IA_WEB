import { BaseResponse } from "src/app/core/responses/base.response";
import { GrupoEconomicoUsuarioMaster } from "../../models/grupos-economicos/grupo-economico-usuario-master.model";

export class ObterGrupoEconomicoResponse extends BaseResponse {
  id: number;
  nome: string;
  ativo: boolean;
  quantidadeEmpresa: number;
  enviaNotificacao?: boolean;
  duplaAutenticacao?: boolean;
  usuarioMaster: GrupoEconomicoUsuarioMaster;
}