import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { AppSettings } from "src/app/configs/app-settings.config";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { ObterGruposPermissoesResponse } from "../core/responses/grupo-permissao/obter-grupos-permissoes-response";
import { ObterPermissoesUsuarioResponse } from "../core/responses/grupo-permissao/obter-permissoes-usuario.response";
import { IGrupoPermissaoService } from "./interfaces/grupo-permissao.service";

@Injectable()
export class GrupoPermissaoService implements IGrupoPermissaoService {
  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApiADM}grupo-permissoes`;

  obterGruposPermissoes(): Observable<ObterGruposPermissoesResponse> {
    let url = `${this.api}/acesso`;

    return this.http.get<ObterGruposPermissoesResponse>(url)
      .pipe(map(data => this.transformToObterGruposPermissoesResponse(data)));
  }

  obterPermisssoesUsuario(): Observable<ObterPermissoesUsuarioResponse> {
    let url = `${this.api}/permissoes-usuario`;

    return this.http.get<ObterPermissoesUsuarioResponse>(url)
      .pipe(map(data => this.transformToObterPermissoesUsuarioResponse(data)));
  }

  //#region Private

  private transformToObterGruposPermissoesResponse(data: any): ObterGruposPermissoesResponse {
    let response: ObterGruposPermissoesResponse = new ObterGruposPermissoesResponse()

    if (data.isSuccessful) {
      response.grupoPermissoes = data.result.grupoPermissoes;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName)
    });

    return response;
  }

  private transformToObterPermissoesUsuarioResponse(data: any): ObterPermissoesUsuarioResponse {
    let response: ObterPermissoesUsuarioResponse = new ObterPermissoesUsuarioResponse()

    if (data.isSuccessful) {
      response.permissoes = data.result.permissoes;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName)
    });

    return response;
  }

  //#endregion
}