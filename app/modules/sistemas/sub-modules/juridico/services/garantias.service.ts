import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { ObterDadosGarantiaResponse } from '../core/responses/obter-dados-garantia.response';
import { ObterListaGarantiasResponse } from '../core/responses/obter-lista-garantias.response';
import { Registro } from '../core/model/registro.model';
import { FiltroGarantiasRegistros } from '../core/model/filtro-garantias-registros.model';

@Injectable({
  providedIn: 'root'
})
export class GarantiasService {
  api: string = `${this.appSettings.baseUrlApiRegulatorio}garantias`;

  constructor(
    private appSettings: AppSettings, 
    private http: HttpClient
  ) {}

  obterListaGarantias(pageIndex: number = 0, pageSize: number = 25, filtro: FiltroGarantiasRegistros): Observable<ObterListaGarantiasResponse> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize)

      if (filtro) {
        Object.keys(filtro).forEach((key) => {
          if (filtro[key] !== '' || filtro[key].length !== 0) {
            if (key === 'uf') {
              filtro[key].forEach((value) => {
                params = params.append(key, value);
              });
            } else {
              params = params.append(key, filtro[key]);
            }
          }
        });
      }

    return this.http.get<ObterListaGarantiasResponse>(this.api, { params: params });
  }

  cadastrarGarantia(payload: any): Observable<any> {
    return this.http.post(this.api, payload, { responseType: 'text'});
  }

  editarGarantia(payload: any, idGarantia): Observable<any> {
    const url = `${this.api}/${idGarantia}`;

    return this.http.put(url, payload, { responseType: 'text'});
  }

  deletarGarantia(idGarantia: number) {
    const url = `${this.api}/${idGarantia}`;

    return this.http.delete(url);
  }

  consultarGarantiaPorId(id: number){
    const url = `${this.api}/${id}`;

    return this.http.get<Registro>(url);
  }

  obterDadosGarantia(uf: string) {
    const url = `${this.api}/${uf}`;

    return this.http.get(url).pipe(map(data => this.transformToObterDadosGarantiaResponse(data)));
  }

  transformToObterDadosGarantiaResponse(data: any): ObterDadosGarantiaResponse {
    let response: ObterDadosGarantiaResponse = new ObterDadosGarantiaResponse();

    if (data != null) {
      response.dadosGarantia = data;
      return response
    }
  }
}
