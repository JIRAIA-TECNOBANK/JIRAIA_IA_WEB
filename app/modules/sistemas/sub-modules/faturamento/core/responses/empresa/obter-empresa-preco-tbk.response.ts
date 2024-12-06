import { BaseResponse } from "src/app/core/responses/base.response";
import { EmpresaPrecoTbk } from "../../models/cesta-servico/cesta-empresa.model";

export class ObterEmpresaPrecoTecnobankResponse extends BaseResponse {
    listaEmpresaPrecoTecnobank: EmpresaPrecoTbk[];
}