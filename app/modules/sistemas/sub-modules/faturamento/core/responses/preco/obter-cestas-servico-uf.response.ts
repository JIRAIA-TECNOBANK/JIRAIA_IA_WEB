import { BaseResponse } from "src/app/core/responses/base.response";
import { CestaServico } from "../../models/cesta-servico/cesta-servico.model";

export class ObterCestasServicoUfResponse extends BaseResponse {
    cestaServicos: CestaServico[];
}