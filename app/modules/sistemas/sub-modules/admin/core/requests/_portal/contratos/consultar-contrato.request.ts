import { TipoOperacao } from "../../../../../crm/core/enums/tipo-operacao.enum";
import { TipoStatusTransacao } from "../../../../../crm/core/enums/tipo-status-transacao.enum";

export class ConsultarContratoRequest {
    numeroContrato: string;
    uf: string;
    statusTransacao?: TipoStatusTransacao;
    tipoOperacao?: TipoOperacao;
}
