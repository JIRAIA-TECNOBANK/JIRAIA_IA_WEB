import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AppSettings } from "src/app/configs/app-settings.config";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { CriarPerfilRequest } from "../core/requests/perfis/criar-perfil.request";
import { AtivarInativarResponse } from "../core/responses/perfis/ativar-inativar.response";
import { CriarPerfilResponse } from "../core/responses/perfis/criar-perfil.response";
import { ObterPerfilResponse } from "../core/responses/perfis/obter-perfil.response";
import { ObterPerfisPaginationResponse } from "../core/responses/perfis/obter-perfis-pagination.response";
import { IPerfisService } from "./interfaces/perfis.interface.service";
import { PerfilFiltro } from "../core/models/perfis/perfilFiltro.model";

@Injectable()
export class PerfisService implements IPerfisService {
  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApiADM}perfis`;

  obterPerfisPaginado(pageIndex: number = 0, pageSize: number = 25, filtro: any = '', sort: string = ''): Observable<ObterPerfisPaginationResponse> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize)
      .set('sort', sort)

    if (filtro) {
      Object.keys(filtro).forEach((key) => {
        if (filtro[key] !== '' || filtro[key].length !== 0) {
          if (key == 'perfilId') {
            filtro[key].forEach((value) => {
              params = params.append(key, value);
            });
          } else params = params.append(key, filtro[key]);
        }
      })
    };
    return this.http.get<ObterPerfisPaginationResponse>(this.api, { params: params })
      .pipe(map(data => this.transformToObterPerfisPaginadoResponse(data)));
  }

  obterPerfil(perfilId: number): Observable<ObterPerfilResponse> {
    let url = `${this.api}/${perfilId}`;

    return this.http.get<ObterPerfilResponse>(url)
      .pipe(map(data => this.transformToObterPerfilResponse(data)));
  }

  criarPerfil(criarPerfilRequest: CriarPerfilRequest): Observable<CriarPerfilResponse> {
    return this.http.post<CriarPerfilResponse>(this.api, criarPerfilRequest)
      .pipe(map(data => this.transformToCriarPerfilResponse(data)));
  }

  atualizarPerfil(perfilId: number, criarPerfilRequest: CriarPerfilRequest): Observable<CriarPerfilResponse> {
    let url = `${this.api}/${perfilId}`;

    return this.http.put<CriarPerfilResponse>(url, criarPerfilRequest)
      .pipe(map(data => this.transformToCriarPerfilResponse(data)));
  }

  ativarPerfil(perfilId: number) {
    let url = `${this.api}/${perfilId}/ativar`;

    return this.http.put<AtivarInativarResponse>(url, null)
      .pipe(map(data => this.transformToAtivarInativarPerfil(data)));
  }

  inativarPerfil(perfilId: number): Observable<AtivarInativarResponse> {
    let url = `${this.api}/${perfilId}/inativar`;

    return this.http.delete<AtivarInativarResponse>(url)
      .pipe(map(data => this.transformToAtivarInativarPerfil(data)));
  }

  //#region Private

  private transformToObterPerfisPaginadoResponse(data: any): ObterPerfisPaginationResponse {
    let response: ObterPerfisPaginationResponse = new ObterPerfisPaginationResponse()

    if (data.isSuccessful) {
      response.totalItems = data.result.totalItems;
      response.perfis = data.result.perfis;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToObterPerfilResponse(data: any): ObterPerfilResponse {
    let response: ObterPerfilResponse = new ObterPerfilResponse()

    if (data.isSuccessful) {
      response.perfilId = data.result.perfilId;
      response.nome = data.result.nome;
      response.descricao = data.result.descricao;
      response.ativo = data.result.ativo;
      response.grupoPermissaoPerfil = data.result.grupoPermissaoPerfil;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToCriarPerfilResponse(data: any): CriarPerfilResponse {
    let response: CriarPerfilResponse = new CriarPerfilResponse()

    if (data.isSuccessful) {
      response.perfilId = data.result.perfilId;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToAtivarInativarPerfil(data: any): AtivarInativarResponse {
    let response: AtivarInativarResponse = new AtivarInativarResponse()

    if (data.isSuccessful) {
      response = data.result;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  //#endregion
}
