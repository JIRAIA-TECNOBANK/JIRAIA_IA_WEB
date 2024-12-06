import { BaseResponse } from "src/app/core/responses/base.response";
import { TransacoesProtocoloDsMensagem } from "../../../models/_portal/transacoes/transacoes-protocolo-ds-mensagem.model";

export class ObterDsMensagemResponse extends BaseResponse {
  transacaoProtocoloDsMensagem: TransacoesProtocoloDsMensagem[];
}