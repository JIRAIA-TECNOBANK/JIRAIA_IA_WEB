import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { ObterDadosRegistroResponse } from '../core/responses/obter-dados-registro.response';
import { ObterListaRegistrosResponse } from '../core/responses/obter-lista-registros.response';
import { Registro } from '../core/model/registro.model';
import { FiltroGarantiasRegistros } from '../core/model/filtro-garantias-registros.model';

@Injectable({
  providedIn: 'root'
})
export class RegistrosService {
  api: string = `${this.appSettings.baseUrlApiRegulatorio}registros`;

  constructor(private appSettings: AppSettings, private http: HttpClient) {}

  obterListaRegistros(pageIndex: number = 0, pageSize: number = 25, filtro: FiltroGarantiasRegistros): Observable<ObterListaRegistrosResponse> {
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

    return this.http.get<ObterListaRegistrosResponse>(this.api, { params: params });
  }

  cadastrarRegistro(payload: any): Observable<any> {

    return this.http.post(this.api, payload, { responseType: 'text'});
  }

  editarRegistro(payload: any, idRegistro): Observable<any> {
    const url = `${this.api}/${idRegistro}`;

    return this.http.put(url, payload, { responseType: 'text'});
  }

  deletarRegistro(idRegistro: number) {
    const url = `${this.api}/${idRegistro}`;

    return this.http.delete(url);
  }

  consultarRegistroPorId(id: number){
    const url = `${this.api}/${id}`;

    return this.http.get<Registro>(url);
  }

  obterDadosRegistro(uf: string) {
    const url = `${this.api}/${uf}`;
    //const params = new HttpParams().set('UF', uf);

    return this.http.get(url).pipe(map(data => this.transformToObterDadosRegistroResponse(data)));
  }

  transformToObterDadosRegistroResponse(data: any): ObterDadosRegistroResponse {
    let response: ObterDadosRegistroResponse = new ObterDadosRegistroResponse();
    if (data != null) {
      response.dadosRegistro = data;
      return response
    }
  }
}
