import { BaseResponse } from "src/app/core/responses/base.response";
import { NotificacaoPaginado } from "../../models/notificacao/notificacao-paginado";

export class ObterNotificacoesPaginationResponse extends BaseResponse {
  notificacoes: NotificacaoPaginado[];
  pageIndex: number;
  totalItems: number;
}