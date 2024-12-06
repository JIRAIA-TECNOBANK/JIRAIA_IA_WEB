import { BaseResponse } from "src/app/core/responses/base.response";
import { InformacoesContabeis } from "../../models/empresa/informacoes-contabeis.model";

export class ObterInformacoesContabeisResponse extends BaseResponse {
    informacoesContabeis: InformacoesContabeis;
}