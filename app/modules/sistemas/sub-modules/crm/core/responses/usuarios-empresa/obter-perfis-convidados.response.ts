import { BaseResponse } from "src/app/core/responses/base.response";
import { PerfisConvidados } from "../../models/usuarios-empresa/perfis-convidados.model";

export class ObterPerfisConvidadosResponse extends BaseResponse {
  perfis: PerfisConvidados[];
}