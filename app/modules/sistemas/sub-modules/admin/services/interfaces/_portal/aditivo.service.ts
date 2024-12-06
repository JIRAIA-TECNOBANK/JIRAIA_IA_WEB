import { Observable } from "rxjs";
import { AlterarAditivoRequest } from "../../../core/requests/_portal/aditivos/alterar-aditivo.request";
import { AlterarAditivoResponse } from "../../../core/responses/_portal/aditivos/alterar-aditivo.response";

export interface IAditivoService {
  alterarAditivo(aditivo: AlterarAditivoRequest): Observable<AlterarAditivoResponse>;
}