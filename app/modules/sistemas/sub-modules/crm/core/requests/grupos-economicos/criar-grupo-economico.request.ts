import { GrupoEconomicoUsuarioMaster } from "../../models/grupos-economicos/grupo-economico-usuario-master.model";

export class SubmitGrupoEconomicoRequest {
  nome: string;
  ativo: boolean;
  usuario: GrupoEconomicoUsuarioMaster;
}