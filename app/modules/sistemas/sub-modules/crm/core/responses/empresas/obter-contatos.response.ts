import { BaseResponse } from "src/app/core/responses/base.response";
import { Contatos } from "../../models/empresas/contato.model";

export class ObterContatosResponse extends BaseResponse {
    contatosAdicionais: ContatosResponse[];
}

export class ContatosResponse {
    id: number;
    contato: Contatos;
}