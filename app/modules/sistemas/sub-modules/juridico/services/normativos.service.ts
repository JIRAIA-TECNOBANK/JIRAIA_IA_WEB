import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { ObterListaNormativoResponse } from '../core/responses/obter-lista-normativos.response';
import { FiltroNormativos, Normativo } from '../core/model/normativos.model';
import { ObterUfsParaAtualizacaoResponse } from '../core/responses/obter-ufs-atualizacao.response';
import { ObterListaTipoNormativoResponse } from '../core/responses/obter-tipo-normativo.response';

@Injectable({
  providedIn: 'root'
})
export class NormativosService {

  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApiRegulatorio}normativos`;

  cadastrarNormativo(queryParams: any, fileBlob: Blob, fileName: string): Observable<any> {

    const formData: FormData = new FormData();

    if (queryParams != undefined) {
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] !== '' && queryParams[key] !== null && queryParams[key] !== undefined) {
          formData.append(key, queryParams[key]);
        }
      });
    }

    formData.append('Arquivo', fileBlob, fileName);

    return this.http.post(this.api, formData, { responseType: 'text'});
  }

  editarNormativo(queryParams: any, fileBlob: Blob = null, fileName: string = null, id: any): Observable<any> {
    const url = `${this.api}/${id}`;

    const formData: FormData = new FormData();

    if (queryParams != undefined) {
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] !== '' && queryParams[key] !== null && queryParams[key] !== undefined) {
          formData.append(key, queryParams[key]);
        }
      });
    }

    if(fileBlob != null){
      formData.append('Arquivo', fileBlob, fileName);
    }

    return this.http.put(url, formData, { responseType: 'text' });
  }

  obterListaNormativo(pageIndex: number = 0, pageSize: number = 25, filtro: FiltroNormativos): Observable<ObterListaNormativoResponse> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize)

    if (filtro) {
      Object.keys(filtro).forEach((key) => {
        if (filtro[key] !== '' || filtro[key].length !== 0) {
          if (key === 'tipoRegistro' || key === 'uf' || key === 'status' || key === 'tipo') {
            filtro[key].forEach((value) => {
              params = params.append(key, value);
            });
          } else {
            params = params.append(key, filtro[key]);
          }
        }
      });
    }

    return this.http.get<ObterListaNormativoResponse>(this.api, { params: params });
  }

  obterUfsParaAtualizacao(): Observable<ObterUfsParaAtualizacaoResponse> {
    const url = `${this.api}/ufs-recentes`;

    return this.http.get(url).pipe(map(data => this.transformToObterTaxasVigentesResponse(data)));
  }

  downloadNormativo(idNormativo: number) {
    const url = `${this.api}/download/${idNormativo}`;
    const params = new HttpParams().set('id', idNormativo);
    const httpOptions = {
      responseType: 'blob' as 'json'
    };

    return this.http.get(url, { params, ...httpOptions }).pipe(map(data => this.transformToDownloadNormativoResponse(data)));
  }

  ativarNormativo(idNormativo: number) {
    const url = `${this.api}/ativar-arquivar/${idNormativo}`;
    const params = new HttpParams().set('id', idNormativo);

    return this.http.put(url, null, { params: params, responseType: 'text' });
  } 

  arquivarNormativo(idNormativo: number) {
    const url = `${this.api}/ativar-arquivar/${idNormativo}`;
    const params = new HttpParams().set('id', idNormativo);

    return this.http.put(url, null, { params: params, responseType: 'text' });
  }

  deletarNormativo(idNormativo: number) {
    const url = `${this.api}/${idNormativo}`;

    return this.http.delete(url);
  }

  consultarNormativoPorId(id: number){
    const url = `${this.api}/${id}`;

    return this.http.get<Normativo>(url);
  }

  obterListaTipoNormativo(): Observable<ObterListaTipoNormativoResponse> {
    const url = `${this.appSettings.baseUrlApiRegulatorio}filtros/tipo-normativo`;

    return this.http.get(url).pipe(map(data => this.transformToObterListaTipoNormativoResponse(data)));
  } 

  transformToObterListaTipoNormativoResponse(data: any): ObterListaTipoNormativoResponse {
    let response: ObterListaTipoNormativoResponse = new ObterListaTipoNormativoResponse();
    if (data != null) {
      response.tiposNormativo = data.result.tiposNormativo;
      return response
    }
  }

  transformToDownloadNormativoResponse(data: any) {
    let response: any;
    if (data != null) {
      response = data;
      return response
    }
  }

  transformToObterTaxasVigentesResponse(data: any): ObterUfsParaAtualizacaoResponse {
    let response: ObterUfsParaAtualizacaoResponse = new ObterUfsParaAtualizacaoResponse();
    if (data != null) {
      response.ufsRecentes = data;
      return response
    }
  }
}
