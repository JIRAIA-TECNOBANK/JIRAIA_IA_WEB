import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { Observable } from 'rxjs';

import { IProtocolo } from './interfaces/protocolos.interface.service';

import { ProtocoloPaginado } from '../core/models/protocolos/protocolos-paginado';
import { ObterProtocolosPaginationResponse } from '../core/responses/protocolos/obter-protocolo-paginado.response';

@Injectable({
  providedIn: 'root'
})
export class ProtocolosService implements IProtocolo {
  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApieGarantiaBackOfficeTecnobank}protocolos`;

  criarProtocolo(protocolo: { uf: string, ativo: boolean, transacaoSimulada: boolean }): Observable<any> {
    return this.http.post<any>(`${this.api}`, protocolo)
      .pipe(
        map(response => {
          // Caso precise fazer alguma transformação na resposta
          return response;
        })
      );
  }

  atualizarProtocolo(id: string, protocolo: { uf: string, ativo: boolean, transacaoSimulada: boolean }): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}`, protocolo)
      .pipe(map(response => response));
  }

  excluirProtocolo(id: string): Observable<any> {
    return this.http.delete<any>(`${this.api}/${id}`)
      .pipe(map(response => response));
  }

  obterProtocoloPorId(id: string): Observable<ProtocoloPaginado> {
    return this.http.get<ProtocoloPaginado>(`${this.api}/${id}`).pipe(map(response => response));
  }

  obterProtocoloPaginado(pageIndex: number = 0, pageSize: number = 25, filtro: any = '', sort: string = '',): Observable<ObterProtocolosPaginationResponse> {
    let params = new HttpParams()
      .set('PageIndex', pageIndex.toString())
      .set('PageSize', pageSize.toString())

    if (filtro) {
      Object.keys(filtro).forEach((key) => {
        const value = filtro[key];
        if (value) {
          switch (key) {
            case 'eGarantiaNumeroProtocolo':
              params = params.append('eGarantiaNumeroProtocolo', value);
              break;
            case 'nsu':
              params = params.append('NSU', value);
              break;
            case 'numeroContrato':
              params = params.append('NumeroContrato', value);
              break;
            case 'aplicacaoNome':
              params = params.append('AplicacaoNome', value);
              break;
            case 'status':
              if (Array.isArray(value) && value.length > 0) {
                value.forEach((statusValue) => {
                  params = params.append('Status', statusValue.toString());
                });
              }
              break;
            default:
              // handle other cases if needed
              break;
          }
        }
      });
    }

    return this.http.get<ObterProtocolosPaginationResponse>(this.api, { params: params })
      .pipe(map(data => this.transformToObterProtocolosPaginationResponse(data)));
  }

  private transformToObterProtocolosPaginationResponse(data: any): ObterProtocolosPaginationResponse {

    let response: ObterProtocolosPaginationResponse = new ObterProtocolosPaginationResponse()

    response.totalItems = data.totalItems;
    response.items = data.items;
    response.errors = data.erros;
    return response;
  }
}
