import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { PesquisaConsultaDetran } from '../core/models/consultar-detran/pesquisa-consulta-detran.model';
import { BaixarTodosArquivosResponse } from '../core/responses/consultar-detran/baixar-todos-arquivos.response';
import { ConsultarDetranResponse } from '../core/responses/consultar-detran/consultar-detran.response';
import { UploadArquivoDetranConciliadoResponse } from '../core/responses/upload-detran/upload-arquivo-detran-conciliado.response';
import { IDetranService } from './interfaces/detran.service';

@Injectable()
export class DetranService implements IDetranService {
  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApiFaturamento}detran`;

  consultarDetran(
    filtros: PesquisaConsultaDetran,
    pageIndex: number = 0,
    pageSize: number = 25,
    sort: string = null
  ): Observable<ConsultarDetranResponse> {
    let url = `${this.api}/consultar-detran`;
    let params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize);

    Object.keys(filtros).forEach((key) => {
      if (filtros[key] !== null) {
        params = params.append(key, filtros[key]);
      }
    });
    if (sort) {
      params = params.append('sort', sort);
    }

    return this.http
      .get(url, { params: params })
      .pipe(map((data) => this.transformToConsultarDetranResponse(data)));
  }

  uploadArquivoDetranConciliado(conciliacaoDetran: any) {
    let url = `${this.api}/salvar-contratos`;

    return this.http.post(url, conciliacaoDetran).pipe(map((data) => this.transformToUploadArquivoDetranConciliado(data)));
  }

  uploadArquivoDetranConciliadoMG(conciliacaoDetran: any) {
    let url = `${this.api}/salvar-contratos/MG`;

    return this.http.post(url, conciliacaoDetran).pipe(map((data) => this.transformToUploadArquivoDetranConciliado(data)));
  }

  baixarTodosArquivos(
    filtros: PesquisaConsultaDetran,
    pageIndex: number = 0,
    pageSize: number = 25,
    sort: string = null
  ) {
    let url = `${this.api}/baixar-todos`;
    let params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize);

    Object.keys(filtros).forEach((key) => {
      if (filtros[key] !== null) {
        params = params.append(key, filtros[key]);
      }
    });
    if (sort) {
      params = params.append('sort', sort);
    }

    return this.http
      .get(url, { params: params })
      .pipe(map((data) => this.transformToBaixarTodosArquivosResponse(data)));
  }

  baixarBoletoOficio(idChamadaDetran: string) {
    let url = `${this.api}/mesclar-boleto-oficio`;

    return this.http.post(url, { idChamadaDetran: idChamadaDetran })
      .pipe(map((data) => this.transformToBaixarBoletoOficio(data)));
  }

  private transformToConsultarDetranResponse(data: any): ConsultarDetranResponse {
    let response: ConsultarDetranResponse = new ConsultarDetranResponse()

    if (data.isSuccessful) {
      response.detranPagamentosResponse = data.result.detranPagamentosResponse;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToUploadArquivoDetranConciliado(data: any): any {
    let response: UploadArquivoDetranConciliadoResponse = new UploadArquivoDetranConciliadoResponse();

    if (data.isSuccessful) {
      response = data;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToBaixarTodosArquivosResponse(data: any) {
    let response: BaixarTodosArquivosResponse = new BaixarTodosArquivosResponse()
    console.log(data);

    if (data.isSuccessful) {
      response.base64 = data.result.base64;
      response.fileName = data.result.fileName;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToBaixarBoletoOficio(data: any) {
    let response: BaixarTodosArquivosResponse = new BaixarTodosArquivosResponse()
    console.log(data);

    if (data.isSuccessful) {
      response.base64 = data.result.base64;
      response.fileName = data.result.fileName;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }
}
