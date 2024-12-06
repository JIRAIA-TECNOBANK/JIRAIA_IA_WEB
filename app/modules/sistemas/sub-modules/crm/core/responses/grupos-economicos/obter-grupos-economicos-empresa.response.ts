import { BaseResponse } from "src/app/core/responses/base.response";
import { GrupoEconomicoUsuarioMaster } from "../../models/grupos-economicos/grupo-economico-usuario-master.model";

export class ObterGruposEconomicosEmpresaResponse extends BaseResponse {
    grupoEconomicoId: number;
    nome: string;
    ativo: boolean;
    enviaNotificacao?: boolean;
    usuario: GrupoEconomicoUsuarioMaster;
}