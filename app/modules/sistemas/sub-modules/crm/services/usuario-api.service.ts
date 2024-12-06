import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AppSettings } from "src/app/configs/app-settings.config";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { UsuarioApiRequest } from "../core/requests/usuario-api/usuario-api.request";
import { AtivarInativarUsuarioApiResponse } from "../core/responses/usuario-api/ativar-inativar-usuario-api.response";
import { EnviarCredenciaisResponse } from "../core/responses/usuario-api/enviar-credenciais.response";
import { ObterUsuarioApiResponse } from "../core/responses/usuario-api/obter-usuario-api.response";
import { RedefinirCredenciaisResponse } from "../core/responses/usuario-api/redefinir-credenciais.response";
import { IUsuariosApiService } from "./interfaces/usuarios-api.interface.service";

@Injectable()
export class UsuariosApiService implements IUsuariosApiService {
  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApiCRM}usuarios-api`;

  obterUsuariosApi(empresaId: number): Observable<ObterUsuarioApiResponse> {
    let url = `${this.api}/${empresaId}`;

    return this.http.get<ObterUsuarioApiResponse>(url)
      .pipe(map(data => this.transformToObterUsuariosApiPaginado(data)));
  }

  ativarUsuarioApi(usuarioApiId: number): Observable<AtivarInativarUsuarioApiResponse> {
    let url = `${this.api}/${usuarioApiId}/ativar`;

    return this.http.put<AtivarInativarUsuarioApiResponse>(url, null)
      .pipe(map(data => this.transformToAtivarInativarUsuarioApi(data)));
  }

  inativarUsuarioApi(usuarioApiId: number): Observable<AtivarInativarUsuarioApiResponse> {
    let url = `${this.api}/${usuarioApiId}/inativar`;

    return this.http.delete<AtivarInativarUsuarioApiResponse>(url)
      .pipe(map(data => this.transformToAtivarInativarUsuarioApi(data)));
  }

  redefinirCredenciais(usuarioApiId: number): Observable<RedefinirCredenciaisResponse> {
    let url = `${this.api}/${usuarioApiId}/redefinir-credenciais`;

    return this.http.put<RedefinirCredenciaisResponse>(url, null)
      .pipe(map(data => this.transformToRedefinirCredenciais(data)));
  }

  enviarCredenciais(usuarioApiId: number, emails: UsuarioApiRequest): Observable<EnviarCredenciaisResponse> {
    let url = `${this.api}/${usuarioApiId}/enviar-credenciais`;

    return this.http.post<EnviarCredenciaisResponse>(url, emails)
      .pipe(map(data => this.transformToEnviarCredenciaisResponse(data)));
  }

  //#region Privates

  private transformToObterUsuariosApiPaginado(data: any): ObterUsuarioApiResponse {
    var response: ObterUsuarioApiResponse = new ObterUsuarioApiResponse();

    if (data.isSuccessful) {
      response.usuariosApi = data.result.usuariosApi;

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => response.addError(error.code, error.message, error.propertyName));
    return response;
  }

  private transformToAtivarInativarUsuarioApi(data: any): AtivarInativarUsuarioApiResponse {
    var response: AtivarInativarUsuarioApiResponse = new AtivarInativarUsuarioApiResponse();

    if (data.isSuccessful) {
      response.id = data.result.id;
      response.ativo = data.result.ativo;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToRedefinirCredenciais(data: any): RedefinirCredenciaisResponse {
    var response: RedefinirCredenciaisResponse = new RedefinirCredenciaisResponse();

    if (data.isSuccessful) {
      response.id = data.result.id;

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToEnviarCredenciaisResponse(data: any): EnviarCredenciaisResponse {
    var response: EnviarCredenciaisResponse = new EnviarCredenciaisResponse();

    if (data.isSuccessful) {
      response.id = data.result.id;
      response.emailsRecebemNotificacao = data.result.emailsRecebemNotificacao;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => response.addError(error.code, error.message, error.propertyName));
    return response;
  }

  //#endregion

}