import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from "rxjs/operators";
import { AppSettings } from 'src/app/configs/app-settings.config';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { ObterGrupoPermissoesResponse } from '../core/responses/grupo-permissoes/obter-grupo-permissoes.response';
import { _OldObterGrupoPermissoesResponse } from '../core/responses/grupo-permissoes/_old/obter-grupo-permissoes.response';
import { IGrupoPermissoesService } from './interfaces/grupo-permissoes.interface.service';

@Injectable({
  providedIn: 'root'
})
export class GrupoPermissoesService implements IGrupoPermissoesService {

  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApiCRM}2.0/grupo-permissoes`;

  obterGruposPermissoes(): Observable<ObterGrupoPermissoesResponse> {
    let url = `${this.api}/acesso`;

    return this.http.get<ObterGrupoPermissoesResponse>(url)
        .pipe(map(data => this.transformToObterGruposPermissoesResponse(data)));
}

//#region Private

private transformToObterGruposPermissoesResponse(data: any): ObterGrupoPermissoesResponse {
  let response: ObterGrupoPermissoesResponse = new ObterGrupoPermissoesResponse()

  if (data.isSuccessful) {
      response.grupoPermissoes = data.result.grupoPermissoes;
      return response
  }

  data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName)
  });

  return response;
}

//#endregion

  //#region OLD
  _oldApi: string = `${this.appSettings.baseUrlApiCRM}grupo-permissoes`;

  _oldObterGruposPermissoes(): Observable<_OldObterGrupoPermissoesResponse> {
    let url = `${this._oldApi}/acesso`;

    return this.http.get<_OldObterGrupoPermissoesResponse>(url)
      .pipe(map(data => this._oldTransformToObterGruposPermissoesResponse(data)));
  }

  //#region Private

  private _oldTransformToObterGruposPermissoesResponse(data: any): _OldObterGrupoPermissoesResponse {
    let response: _OldObterGrupoPermissoesResponse = new _OldObterGrupoPermissoesResponse()

    if (data.isSuccessful) {
      response.grupos = data.result.grupos;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName)
    });

    return response;
  }

  //#endregion
  //#endregion
}
