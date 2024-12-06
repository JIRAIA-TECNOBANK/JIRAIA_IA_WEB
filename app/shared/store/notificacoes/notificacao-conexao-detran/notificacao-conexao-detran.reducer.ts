import { createReducer, on } from "@ngrx/store";
import { NotificacaoConexaoDetranActions } from "./actions";
import { INotificacaoConexaoDetran } from "./notificacao-conexao-detran.model";

const initializeState: INotificacaoConexaoDetran = {
  mensagem: ''
}

export const notificacaoConexaoDetranReducer = createReducer<INotificacaoConexaoDetran>(initializeState,
  on(NotificacaoConexaoDetranActions.notificarConexaoDetran, (state, action): INotificacaoConexaoDetran => {
    return {
      ...state,
      mensagem: action.payload.mensagem
    }
  })
);