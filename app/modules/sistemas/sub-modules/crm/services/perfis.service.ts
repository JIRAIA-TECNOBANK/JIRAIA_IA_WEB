import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AppSettings } from 'src/app/configs/app-settings.config';
import { ErrorMessage } from "src/app/core/responses/error-message";
import { CriarPerfilRequest } from "../core/requests/perfis/criar-perfil.request";
import { CriarPerfilResponse } from "../core/responses/empresas/criar-perfil.response";
import { AtivarInativarResponse } from "../core/responses/perfis/ativar-inativar.response";
import { ObterPerfilResponse } from "../core/responses/perfis/obter-perfil.response";
import { ObterPerfisPaginationResponse } from "../core/responses/perfis/obter-perfis-pagination.response";
import { _oldInserirPermissaoResponse } from "../core/responses/perfis/_old/inserir-permissao.response";
import { _oldObterPerfilPorIdResponse } from "../core/responses/perfis/_old/obter-perfil-por-id.response";
import { _oldObterPerfilResponse } from "../core/responses/perfis/_old/obter-perfis.response";
import { IPerfisService } from './interfaces/perfis.interface.service';

@Injectable()
export class PerfisService implements IPerfisService {

  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApiCRM}2.0/perfis`;
  
  obterPerfisPaginado(pageIndex: number = 0, pageSize: number = 25, filtro: any = '', sort: string = ''): Observable<ObterPerfisPaginationResponse> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize)
      .set('sort', sort)

    if (filtro) {
      Object.keys(filtro).forEach((key) => {
        if (filtro[key]) { params = params.append(key, filtro[key]) }
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
    let url = `${this.api}/${perfilId}/empresa/${criarPerfilRequest.empresaId}`;

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
      response.convidado = data.result.convidado;
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

  //#region OLD
  _oldApi: string = `${this.appSettings.baseUrlApiCRM}perfis`;

  _oldInserirPermissao(perfilId: number, permissaoId: number) {
    let url = `${this._oldApi}/${perfilId}/permissoes/${permissaoId}`;
    return this.http
      .post<_oldInserirPermissaoResponse>(url, null)
      .pipe(map((data) => this._oldTransformToInserirPermissaoResponse(data)));
  }

  _oldRemoverPermissao(perfilId: number, permissaoId: number) {
    let url = `${this._oldApi}/${perfilId}/permissoes/${permissaoId}`;
    return this.http
      .delete<_oldInserirPermissaoResponse>(url)
      .pipe(map((data) => this._oldTransformToInserirPermissaoResponse(data)));
  }

  _oldObterPerfilPorId(perfilId: number) {
    let url = `${this._oldApi}/${perfilId}`;

    return this.http.get<_oldObterPerfilPorIdResponse>(url)
      .pipe(map(data => this._oldTransformToObterPerfilPorId(data)));
  }

  _oldObterPerfil(perfilId: number): Observable<_oldObterPerfilResponse> {
    let url = `${this._oldApi}/${perfilId}`;

    return this.http.get<_oldObterPerfilResponse>(url)
        .pipe(map(data => this._oldTransformToObterPerfilResponse(data)));
}

  //#region Privates
  
  private _oldTransformToInserirPermissaoResponse(data: any): _oldInserirPermissaoResponse {
    let response: _oldInserirPermissaoResponse = new _oldInserirPermissaoResponse();
    
    if (data.isSuccessful) {
      response = <_oldInserirPermissaoResponse>{
        permissao: data.result.permissao,
        perfil: data.result.perfil
      };
      
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName); });
    return response;
  }

  private _oldTransformToObterPerfilPorId(data: any): _oldObterPerfilPorIdResponse {
    let response: _oldObterPerfilPorIdResponse = new _oldObterPerfilPorIdResponse();
    
    if (data.isSuccessful) {
      response = <_oldObterPerfilPorIdResponse>{
        nome: data.result.nome,
        descricao: data.result.descricao,
        ativo: data.result.ativo
      };

      return response;
    }
    
    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    
    return response;
  }

  private _oldTransformToObterPerfilResponse(data: any): _oldObterPerfilResponse {
    let response: _oldObterPerfilResponse = new _oldObterPerfilResponse()

    if (data.isSuccessful) {
        response.id = data.result.id;
        response.empresaId = data.result.empresaId;
        response.nome = data.result.nome;
        response.descricao = data.result.descricao;
        response.ativo = data.result.ativo;
        response.grupos = data.result.grupos;
        return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
}
  
  //#endregion
//#endregion
}
