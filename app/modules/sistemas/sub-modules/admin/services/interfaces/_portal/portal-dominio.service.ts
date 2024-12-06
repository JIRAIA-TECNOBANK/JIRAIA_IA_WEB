import { Observable } from "rxjs";
import { DominioResponse } from "../../../core/responses/_portal/dominios/dominio.response";

export interface IPortalDominioService {
    obterPorTipo(tipoDominio: string): Observable<DominioResponse>
}
