import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { SolicitarRelatorioRequest } from '../core/requests/solicitar-relatorio.request';
import { ObterRelatoriosResponse } from '../core/responses/obter-relatorios.response';
import { SolicitarRelatorioResponse } from '../core/responses/solicitar-relatorios.response';
import { ValidarRelatoriosProcessandoResponse } from '../core/responses/validar-relatorios-processando.response';
import { IRelatoriosService } from './interfaces/relatorios.service';

@Injectable({
  providedIn: 'root'
})
export class RelatoriosService implements IRelatoriosService {

  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApiCRM}relatorios`;

  solicitarRelatorio(solicitarRelatorioRequest: SolicitarRelatorioRequest) {
    let url = `${this.api}/solicitar`;

    return this.http
      .post<SolicitarRelatorioResponse>(url, solicitarRelatorioRequest)
      .pipe(map((data) => this.transformToSolicitarRelatorioResponse(data)));
  }

  obterRelatorios(pageIndex: number, pageSize: number, sort: string) {
    let params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize)
      .set('sort', sort)

    return this.http.get<ObterRelatoriosResponse>(this.api, { params: params })
      .pipe(map(data => this.transformToObterRelatoriosResponse(data)));
  }

  validarRelatoriosProcessando() {
    let url = `${this.api}/validar/emProcessamento`;

    return this.http.get<ValidarRelatoriosProcessandoResponse>(url)
      .pipe(map(data => this.transformTovalidarRelatoriosProcessandoResponse(data)));
  }


  private transformToSolicitarRelatorioResponse(data: any): SolicitarRelatorioResponse {
    let response: SolicitarRelatorioResponse = new SolicitarRelatorioResponse();

    if (data.isSuccessful) {
      response = data.result
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName); });
    return response;
  }

  private transformToObterRelatoriosResponse(data: any): ObterRelatoriosResponse {
    let response: ObterRelatoriosResponse = new ObterRelatoriosResponse()

    if (data.isSuccessful) {
      response.totalItems = data.result.totalItems;
      response.relatorios = data.result.relatorios;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformTovalidarRelatoriosProcessandoResponse(data: any): ValidarRelatoriosProcessandoResponse {
    let response: ValidarRelatoriosProcessandoResponse = new ValidarRelatoriosProcessandoResponse()

    if (data.isSuccessful) {
      response.existemRelatorios = data.result.existemRelatorios;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

}
