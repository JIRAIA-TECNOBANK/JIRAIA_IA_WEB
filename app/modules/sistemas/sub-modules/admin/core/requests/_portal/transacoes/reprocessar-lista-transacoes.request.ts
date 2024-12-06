import { ReprocessarProtocolo } from "../../../../../crm/core/models/transacoes/reprocessar-protocolo.model";

export class ReprocessarListaTransacoesRequest {
    protocolosTransacao: ReprocessarProtocolo[];
    reprocessarDetran: boolean = true;
    reenvioComplemento: boolean;
}