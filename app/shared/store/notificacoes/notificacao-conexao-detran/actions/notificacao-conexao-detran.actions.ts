import { createAction, props } from "@ngrx/store";
import { INotificacaoConexaoDetran } from "../notificacao-conexao-detran.model";

export const notificarConexaoDetran = createAction('[Notificacao] notificar conexao DETRAN', props<{ payload: INotificacaoConexaoDetran }>());