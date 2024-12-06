import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { ObterDadosInstituicaoFinanceiraResponse } from '../core/responses/obter-dados-instituicao-financeira-response';
import { Observable, map } from 'rxjs';
import { ObterListaInstituicaoFinanceiraResponse } from '../core/responses/obter-lista-instituicaoFinanceira.response';
import { ObterListaRegistrosResponse } from '../core/responses/obter-lista-registros.response';
import { Instituicao } from '../core/model/instituicao-financeira.model';

@Injectable({
  providedIn: 'root'
})
export class InstituicaoFinanceiraService {
  api: string = `${this.appSettings.baseUrlApiRegulatorio}instituicaofinanceira`;
  
  constructor(
    private appSettings: AppSettings, 
    private http: HttpClient
  ) {}

  obterListaInstituicaoFinanceira(
    pageIndex: number = 0, 
    pageSize: number = 25, 
    filtros?: any
  ): Observable<ObterListaInstituicaoFinanceiraResponse> {
    let params = new HttpParams().set('pageIndex', pageIndex).set('pageSize', pageSize)

    if (filtros != undefined) {
      Object.keys(filtros).forEach((key) => {
        if (filtros[key] !== '' && filtros[key] !== null && filtros[key] !== undefined) {
          params = params.append(key, filtros[key]);
        }
      });
    }

    return this.http.get<ObterListaInstituicaoFinanceiraResponse>(this.api, { params: params });
  }

  obterDadosInstituicaoFinanceira(uf: string) {
    const url = `${this.api}/${uf}`

    return this.http
      .get(url)
      .pipe(map(data => this.transformToObterDadosInstituicaoResponse(data)));
  }

  transformToObterDadosInstituicaoResponse(data: any): ObterDadosInstituicaoFinanceiraResponse {
    let response: ObterDadosInstituicaoFinanceiraResponse = new ObterDadosInstituicaoFinanceiraResponse();

    if (data != null) {
      response.InstituicaoFinanceira = data;
      return response
    }
  }

  consultarInstituicaoPorId(id: number) {
    const url = `${this.api}/${id}`;
    return this.http.get<Instituicao>(url);
  }

  cadastrarInstituicao(payload: any): Observable<any> {
    return this.http.post(this.api, payload, { responseType: 'text'});
  }

  editarInstituicao(payload: any, id): Observable<any> {
    const url = `${this.api}`;
    payload.id = id;
    return this.http.put(url, payload, { responseType: 'text'});
  }

  deletarInstituicao(id: number) {
    const url = `${this.api}/${id}`;
    return this.http.delete(url);
  }
}
