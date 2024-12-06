import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { Observable } from 'rxjs';
import { IDetran } from './interfaces/detrans.interface.service';
import { ObterDetransPaginationResponse } from '../core/responses/detrans/obter-detran-paginado.response';
import { DetranPaginado } from '../core/models/detrans/detran-paginado';

@Injectable({
  providedIn: 'root'
})
export class DetransService implements IDetran {
  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApieGarantiaBackOfficeTecnobank}detrans`;


  criarDetran(detran: { uf: string, ativo: boolean, transacaoSimulada: boolean }): Observable<any> {
    return this.http.post<any>(`${this.api}`, detran)
      .pipe(
        map(response => {
          // Caso precise fazer alguma transformação na resposta
          return response;
        })
      );
  }

  atualizarDetran(id: string, detran: { uf: string, ativo: boolean, transacaoSimulada: boolean }): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}`, detran)
      .pipe(map(response => response));
  }

  excluirDetran(id: string): Observable<any> {
    return this.http.delete<any>(`${this.api}/${id}`)
      .pipe(map(response => response));
  }


  obterDetranPorId(id: string): Observable<DetranPaginado> {
    return this.http.get<DetranPaginado>(`${this.api}/${id}`).pipe(map(response => response));
  }


  obterDetranPaginado(pageIndex: number = 0, pageSize: number = 25, filtro: any = '', sort: string = '',): Observable<ObterDetransPaginationResponse> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize)


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

    return this.http.get<ObterDetransPaginationResponse>(this.api, { params: params })
      .pipe(map(data => this.transformToObterDetransPaginationResponse(data)));
  }


  private transformToObterDetransPaginationResponse(data: any): ObterDetransPaginationResponse {

    let response: ObterDetransPaginationResponse = new ObterDetransPaginationResponse()

    response.totalItems = data.totalItems;
    response.items = data.items;
    response.errors = data.erros;
    return response;
  }
}
