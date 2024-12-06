import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AppSettings } from 'src/app/configs/app-settings.config';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { SubmitGrupoEconomicoRequest } from '../core/requests/grupos-economicos/criar-grupo-economico.request';
import { ObterEmpresasPaginationResponse } from '../core/responses/empresas/obter-empresas-pagination.response';
import { AtivarInativarGrupoEconomicoResponse } from '../core/responses/grupos-economicos/ativar-inativar-grupos-economico.response';
import { ObterGruposEconomicosEmpresaResponse } from '../core/responses/grupos-economicos/obter-grupos-economicos-empresa.response';
import { ObterGruposEconomicosResponse } from '../core/responses/grupos-economicos/obter-grupos-economicos.response';
import { VincularEmpresaResponse } from '../core/responses/grupos-economicos/vincular-empresa.response';
import { IGruposEconomicosService } from './interfaces/grupos-economicos.interface.service';

import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { ObterGrupoEconomicoEmpresaListaResponse } from '../core/responses/grupos-economicos/obter-grupo-economico-empresas-lista.response';
import { ObterGrupoEconomicoResponse } from '../core/responses/grupos-economicos/obter-grupo-economico.response';

@Injectable()
export class GruposEconomicosService implements IGruposEconomicosService {
  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApiCRM}grupos-economicos`;

  obterGruposEconomicos(
    pageIndex: number = 0,
    pageSize: number = 5,
    filtro: any = '',
    ativo: string = ''
  ): Observable<ObterGruposEconomicosResponse> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize)
    if (filtro) {
      Object.keys(filtro).forEach((key) => {
        if (filtro[key] !== '' || filtro[key].length !== 0) {
          if (key == 'grupoEconomicoId') {
            filtro[key].forEach((value) => {
              params = params.append(key, value);
            });
          } else params = params.append(key, filtro[key]);
        }
      });
    }
    return this.http
      .get<ObterGruposEconomicosResponse>(this.api, { params: params })
      .pipe(map((data) => this.transformToObterGruposEconomicosResponse(data)));
  }

  obterGrupoEconomico(grupoEconomicoId: number, anonimizar: boolean = true) {
    let url = `${this.api}/${grupoEconomicoId}`;

    const params = new HttpParams()
      .set('anonimizar', anonimizar);

    return this.http
      .get(url, { params: params })
      .pipe(map((data) => this.transformToObterGrupoEconomicoResponse(data)));
  }

  atualizarGrupoEconomico(
    grupoEconomicoId: number,
    data: SubmitGrupoEconomicoRequest
  ) {
    let url = `${this.api}/${grupoEconomicoId}`;

    return this.http
      .put(url, data)
      .pipe(
        map((data) => this.transformToObterGrupoEconomicoEmpresaResponse(data))
      );
  }

  obterEmpresas(
    grupoEconomicoId: number = 1,
    filtro: any
  ): Observable<ObterEmpresasPaginationResponse> {
    let url = `${this.api}/${grupoEconomicoId}/empresas`;

    let params = new HttpParams();
    Object.keys(filtro).forEach((key) => {
      if (filtro[key] !== '' || filtro[key].length !== 0)
        params = params.append(key, filtro[key]);
    });

    return this.http
      .get<ObterEmpresasPaginationResponse>(url, { params: filtro })
      .pipe(map((data) => this.transformToObterEmpresasResponse(data)));
  }

  obterEmpresasLista(
    grupoEconomicoId: number
  ): Observable<ObterGrupoEconomicoEmpresaListaResponse> {
    let url = `${this.api}/${grupoEconomicoId}/empresas-lista`;

    return this.http
      .get<ObterGrupoEconomicoEmpresaListaResponse>(url)
      .pipe(map((data) => this.transformToObterEmpresasListaResponse(data)));
  }

  obterEmpresasListaExterna(
    grupoEconomicoId: number
  ): Observable<ObterGrupoEconomicoEmpresaListaResponse> {
    let url = `${this.api}/${grupoEconomicoId}/empresas-lista-externa`;

    return this.http
      .get<ObterGrupoEconomicoEmpresaListaResponse>(url)
      .pipe(map((data) => this.transformToObterEmpresasListaResponse(data)));
  }

  ativarGrupoEconomico(
    grupoEconomicoId: string
  ): Observable<AtivarInativarGrupoEconomicoResponse> {
    let url = `${this.api}/${grupoEconomicoId}/ativar`;

    return this.http
      .put<AtivarInativarGrupoEconomicoResponse>(url, null)
      .pipe(
        map((data) =>
          this.transformToAtivarInativarGrupoEconomicoResponse(data)
        )
      );
  }

  inativarGrupoEconomico(
    grupoEconomicoId: string
  ): Observable<AtivarInativarGrupoEconomicoResponse> {
    let url = `${this.api}/${grupoEconomicoId}/inativar`;

    return this.http
      .delete<AtivarInativarGrupoEconomicoResponse>(url)
      .pipe(
        map((data) =>
          this.transformToAtivarInativarGrupoEconomicoResponse(data)
        )
      );
  }

  vincularEmpresa(
    grupoEconomicoId: number,
    empresaId: number
  ): Observable<VincularEmpresaResponse> {
    let url = `${this.api}/${grupoEconomicoId}/empresa/${empresaId}/vincular`;

    return this.http
      .put<VincularEmpresaResponse>(url, null)
      .pipe(map((data) => this.transformToVincularEmpresaResponse(data)));
  }

  desvincularEmpresa(empresaId: number): Observable<VincularEmpresaResponse> {
    let url = `${this.api}/${empresaId}/desvincular`;

    return this.http
      .delete<VincularEmpresaResponse>(url)
      .pipe(map((data) => this.transformToVincularEmpresaResponse(data)));
  }

  obterEmpresa(
    grupoEconomicoId: number
  ): Observable<ObterGruposEconomicosEmpresaResponse> {
    let url = `${this.api}/grupos-economicos/${grupoEconomicoId}`;

    return this.http
      .get<ObterGruposEconomicosEmpresaResponse>(url)
      .pipe(map((data) => this.transformToObterEmpresaResponse(data)));
  }

  criarGrupoEconomico(
    data: SubmitGrupoEconomicoRequest
  ): Observable<ObterGruposEconomicosEmpresaResponse> {
    let url = `${this.api}`;

    return this.http
      .post<ObterGruposEconomicosEmpresaResponse>(url, data)
      .pipe(
        map((data) => this.transformToObterGrupoEconomicoEmpresaResponse(data))
      );
  }

  //#region Privates

  private transformToObterGruposEconomicosResponse(
    data: any
  ): ObterGruposEconomicosResponse {
    let response: ObterGruposEconomicosResponse =
      new ObterGruposEconomicosResponse();

    if (data.isSuccessful) {
      response.totalItems = data.result.totalItems;
      response.gruposEconomicos = data.result.gruposEconomicos;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
  }

  private transformToObterEmpresasResponse(
    data: any
  ): ObterEmpresasPaginationResponse {
    let response: ObterEmpresasPaginationResponse =
      new ObterEmpresasPaginationResponse();

    if (data.isSuccessful) {
      response.totalItems = data.result.totalItems;
      response.empresas = data.result.empresas;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
  }

  private transformToAtivarInativarGrupoEconomicoResponse(
    data: any
  ): AtivarInativarGrupoEconomicoResponse {
    let response: AtivarInativarGrupoEconomicoResponse =
      new AtivarInativarGrupoEconomicoResponse();

    if (data.isSuccessful) {
      response.grupoEconomicoId = data.result.grupoEconomicoId;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToVincularEmpresaResponse(
    data: any
  ): VincularEmpresaResponse {
    let response: VincularEmpresaResponse = new VincularEmpresaResponse();

    if (data.isSuccessful) {
      response = data.result;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToObterEmpresaResponse(data: any) {
    let response;

    if (data.isSuccessful) {
      response.totalItems = data.result.totalItems;
      response.empresas = data.result.empresas;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
  }

  private transformToObterGrupoEconomicoEmpresaResponse(
    data: any
  ): ObterGruposEconomicosEmpresaResponse {
    let response: ObterGruposEconomicosEmpresaResponse =
      new ObterGruposEconomicosEmpresaResponse();

    if (data.isSuccessful) {
      response.grupoEconomicoId = data.result.grupoEconomicoId;
      response.nome = data.result.nome;
      response.enviaNotificacao = data.result.enviaNotificacao;
      response.usuario = data.result.usuario;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToObterGrupoEconomicoResponse(
    data: any
  ): ObterGrupoEconomicoResponse {
    let response: ObterGrupoEconomicoResponse =
      new ObterGrupoEconomicoResponse();

    if (data.isSuccessful) {
      response = <ObterGrupoEconomicoResponse>{
        id: data.result.id,
        nome: data.result.nome,
        ativo: data.result.ativo,
        quantidadeEmpresa: data.result.quantidadeEmpresa,
        enviaNotificacao: data.result.enviaNotificacao,
        usuarioMaster: data.result.usuarioMaster
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToObterEmpresasListaResponse(
    data: any
  ): ObterGrupoEconomicoEmpresaListaResponse {
    let response: ObterGrupoEconomicoEmpresaListaResponse =
      new ObterGrupoEconomicoEmpresaListaResponse();

    if (data.isSuccessful) {
      response.empresas = data.result.empresas;

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  //#endregion
}
