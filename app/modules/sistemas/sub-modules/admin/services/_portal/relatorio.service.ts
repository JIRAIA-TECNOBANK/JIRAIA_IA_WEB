import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { IRelatoriosService } from '../../../crm/pages/relatorios/services/interfaces/relatorios.service';
import { SolicitarRelatorioRequest } from '../../../crm/pages/relatorios/core/requests/solicitar-relatorio.request';
import { SolicitarRelatorioResponse } from '../../../crm/pages/relatorios/core/responses/solicitar-relatorios.response';
import { ObterRelatoriosResponse } from '../../../crm/pages/relatorios/core/responses/obter-relatorios.response';
import { ValidarRelatoriosProcessandoResponse } from '../../../crm/pages/relatorios/core/responses/validar-relatorios-processando.response';
import { EmitirRelatorioEmailRequest } from '../../../crm/pages/relatorios/core/requests/emitir-relatorio-email.request';
import { EmitirRelatorioEmailResponse } from '../../../crm/pages/relatorios/core/responses/emitir-relatorio-email.response';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PortalRelatoriosService implements IRelatoriosService {
  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApiPortal}relatorios`;

  solicitarRelatorio(solicitarRelatorioRequest: SolicitarRelatorioRequest) {
    let url = `${this.api}/backoffice/solicitar`;

    return this.http
      .post<SolicitarRelatorioResponse>(url, solicitarRelatorioRequest)
      .pipe(map((data) => this.transformToSolicitarRelatorioResponse(data)));
  }

  obterRelatorios(pageIndex: number, pageSize: number, filtros?: any) {
    let url = `${this.api}/backoffice`;
    let params = null;
    params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize)

    if (filtros != undefined) {
      Object.keys(filtros).forEach((key) => {
        if (filtros[key] !== '' || filtros[key].length !== 0) {
          if (key == 'empresaId' || key == 'status' || key == 'dominio') {
            filtros[key].forEach((value) => {
              params = params.append(key, value);
            });
          } else params = params.append(key, filtros[key]);
        }
      });
    }

    return this.http
      .get<ObterRelatoriosResponse>(url, { params: params })
      .pipe(map((data) => this.transformToObterRelatoriosResponse(data)));
  }

  validarRelatoriosProcessando() {
    let url = `${this.api}/validar/emProcessamento`;

    return this.http
      .get<ValidarRelatoriosProcessandoResponse>(url)
      .pipe(
        map((data) =>
          this.transformTovalidarRelatoriosProcessandoResponse(data)
        )
      );
  }

  emitirRelatorioEmail(request: EmitirRelatorioEmailRequest): Observable<EmitirRelatorioEmailResponse> {
    let url = `${this.api}/backoffice/emitir-relatorio`;

    return this.http.post<EmitirRelatorioEmailResponse>(url, request)
      .pipe(map(data => this.transformToEmitirRelatorioEmailResponse(data)));
  }

  private transformToSolicitarRelatorioResponse(
    data: any
  ): SolicitarRelatorioResponse {
    let response: SolicitarRelatorioResponse = new SolicitarRelatorioResponse();

    if (data.isSuccessful) {
      response = data.result;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToObterRelatoriosResponse(
    data: any
  ): ObterRelatoriosResponse {
    let response: ObterRelatoriosResponse = new ObterRelatoriosResponse();

    if (data.isSuccessful) {
      response.totalItems = data.result.totalItems;
      response.relatorios = data.result.relatorios;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformTovalidarRelatoriosProcessandoResponse(
    data: any
  ): ValidarRelatoriosProcessandoResponse {
    let response: ValidarRelatoriosProcessandoResponse =
      new ValidarRelatoriosProcessandoResponse();

    if (data.isSuccessful) {
      response.existemRelatorios = data.result.existemRelatorios;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToEmitirRelatorioEmailResponse(data: any): EmitirRelatorioEmailResponse {
    let response: EmitirRelatorioEmailResponse = new EmitirRelatorioEmailResponse()

    if (data.isSuccessful) {
      response.protocolo = data.result.protocolo;
      response.emails = data.result.emails;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }
}
