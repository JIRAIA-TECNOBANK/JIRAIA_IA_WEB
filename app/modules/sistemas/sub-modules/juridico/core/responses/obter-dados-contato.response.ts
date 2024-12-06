import { BaseResponse } from "src/app/core/responses/base.response";
import { Contato } from "../model/contato.model";

export class ObterDadosContatosResponse extends BaseResponse {
    dadosContatos: Contato[]
}