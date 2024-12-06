import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { AppSettings } from "src/app/configs/app-settings.config";
import { Utility } from "src/app/core/common/utility";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { DominiosResponse } from "../core/responses/dominios/dominios.response";
import { IDominioService } from "./interfaces/dominio.interface.service";

@Injectable()
export class DominioService implements IDominioService {
  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApiCRM}tipo-dominios`;

  obterPorTipo(tipoDominio: string) {
    let url = `${this.api}/${tipoDominio}/dominios`;

    return this.http.get<DominiosResponse>(url)
      .pipe(map(data => this.transformToDominiosResponse(data)));
  }

  private transformToDominiosResponse(data: any): DominiosResponse {
    let response: DominiosResponse = new DominiosResponse()

    if (data.isSuccessful) {
      response.valorDominio = data.result.valorDominio;

      if (data.result.tipoDominio == 'UF_DETRAN') {
        response.valorDominio = Utility.sortValues(response.valorDominio, 'valor')
      }

      return response
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName)
    })
  }
}