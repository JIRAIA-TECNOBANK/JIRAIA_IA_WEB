import { BaseResponse } from "src/app/core/responses/base.response";
import { UsuarioEmpresaGrupoEconomico } from "../../models/usuarios-empresa/usuario-empresa-grupo-economico.model";

export class ObterEmpresasGrupoEconomicoResponse extends BaseResponse {
  empresas: UsuarioEmpresaGrupoEconomico[];
}