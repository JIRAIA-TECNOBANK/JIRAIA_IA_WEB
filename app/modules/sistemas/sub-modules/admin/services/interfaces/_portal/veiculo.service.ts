import { Observable } from "rxjs";
import { ObterEspeciesResponse } from "../../../core/responses/_portal/veiculos/obter-especies.response";

export interface IVeiculoService {
    obterEspecies(): Observable<ObterEspeciesResponse>;
}
