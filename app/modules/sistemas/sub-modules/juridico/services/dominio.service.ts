import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { ObterListaUfResponse } from '../core/responses/obter-ufs.response';
import { DominiosResponse } from '../../admin/core/responses/dominios/dominios.response';
import { ErrorMessage } from 'src/app/core/responses/error-message';

@Injectable({
  providedIn: 'root'
})
export class DominioService {

  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApiRegulatorio}tipo-dominios`;

  obterPorTipo(tipoDominio: string) {
    let url = `${this.api}/${tipoDominio}/dominios`;

    return this.http.get<DominiosResponse>(url)
        .pipe(map(data => this.transformToDominiosResponse(data)));
  }

  private transformToDominiosResponse(data: any): DominiosResponse {
    let response: DominiosResponse = new DominiosResponse()

    if (data.isSuccessful) {
        response.valorDominio = data.result.valorDominio;
        return response
    }

    data.errors.forEach((error: ErrorMessage) => {
        response.addError(error.code, error.message, error.propertyName)
    })
  }
}
