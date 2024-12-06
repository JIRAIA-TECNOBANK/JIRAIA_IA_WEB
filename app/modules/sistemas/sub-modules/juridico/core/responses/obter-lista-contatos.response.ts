import { BaseResponse } from "src/app/core/responses/base.response";
import { Contato } from "../model/contato.model";

export class ObterListaContatosResponse extends BaseResponse {
    result: {
        totalItems: number;
        contatos: Contato[];
    }
}