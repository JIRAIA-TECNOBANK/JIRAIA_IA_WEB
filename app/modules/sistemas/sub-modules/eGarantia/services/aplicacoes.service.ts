import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { Observable } from 'rxjs';


import { AplicacaoPaginado } from '../core/models/aplicacoes/aplicacoes-paginado';
import { ObterAplicacoesPaginationResponse } from '../core/responses/aplicacoes/obter-aplicacao-paginado.response';
import { IAplicacao } from './interfaces/aplicacoes.interface.service ';

@Injectable({
  providedIn: 'root'
})
export class AplicacoesService implements IAplicacao {
  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApieGarantiaBackOfficeTecnobank}aplicacoes`;

  criarAplicacao(aplicacao: { uf: string, ativo: boolean, transacaoSimulada: boolean }): Observable<any> {
    return this.http.post<any>(`${this.api}`, aplicacao)
      .pipe(
        map(response => response)
      );
  }

  obterCredenciais(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}/credenciais`)
      .pipe(map(response => response));
  }

  atualizarAplicacao(id: string, aplicacao: { uf: string, ativo: boolean, transacaoSimulada: boolean }): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}`, aplicacao)
      .pipe(map(response => response));
  }

  excluirAplicacao(id: string): Observable<any> {
    return this.http.delete<any>(`${this.api}/${id}`)
      .pipe(map(response => response));
  }

  obterAplicacaoPorId(id: string): Observable<AplicacaoPaginado> {
    return this.http.get<AplicacaoPaginado>(`${this.api}/${id}`).pipe(map(response => response));
  }

  obterAplicacaoPaginado(pageIndex: number = 0, pageSize: number = 25, filtro: any = '', sort: string = ''): Observable<ObterAplicacoesPaginationResponse> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize);

    if (filtro) {
      Object.keys(filtro).forEach((key) => {
        if (filtro[key]) {
          if (key === 'status' && Array.isArray(filtro[key]) && filtro[key].length == 1) {
            filtro[key].forEach((value) => {
              params = params.append('ativo', value === 2 ? false : true);
            });
          }
        }
      });
    }

    return this.http.get<ObterAplicacoesPaginationResponse>(this.api, { params: params })
      .pipe(map(data => this.transformToObterAplicacoesPaginationResponse(data)));
  }

  private transformToObterAplicacoesPaginationResponse(data: any): ObterAplicacoesPaginationResponse {
    let response: ObterAplicacoesPaginationResponse = new ObterAplicacoesPaginationResponse();
    response.totalItems = data.totalItems;
    response.items = data.items;
    response.errors = data.erros;
    return response;
  }
}
