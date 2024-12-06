import { Observable } from "rxjs";
import { ObterUsuarioApiResponse } from "../../core/responses/usuario-api/obter-usuario-api.response";

export interface IUsuariosApiService {
  obterUsuariosApi(empresaId: number): Observable<ObterUsuarioApiResponse>;
}
