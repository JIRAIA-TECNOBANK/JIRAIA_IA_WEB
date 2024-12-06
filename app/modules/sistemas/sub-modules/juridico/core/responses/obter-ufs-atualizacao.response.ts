import { BaseResponse } from "src/app/core/responses/base.response";
import { Ufs } from "../model/ufs.model";

export class ObterUfsParaAtualizacaoResponse extends BaseResponse {
    ufsRecentes: Ufs[];
}