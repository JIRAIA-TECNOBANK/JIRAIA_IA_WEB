import { BaseResponse } from "src/app/core/responses/base.response";
import { UsuarioServicoGrid } from "../../models/usuario-servico/usuario-servico-grid.model";

export class ObterUsuariosSrdResponse extends BaseResponse {
    usuariosServico: UsuarioServicoGrid[];
    totalItems: number;
}