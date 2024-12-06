import { EnderecoResponse } from "../../core/responses/geograficos/endereco.response";

import { Observable } from "rxjs";

export interface IGeograficoService {
    obterEnderecoPorCep(cep: string): Observable<EnderecoResponse>;
}