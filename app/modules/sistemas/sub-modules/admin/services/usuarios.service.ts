import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { UsuariosFiltro } from '../core/models/usuarios/usuarios-filtro.model';
import { Usuario } from '../core/models/usuarios/usuarios.model';
import { AtivarInativarUsuarioResponse } from '../core/responses/usuarios/ativar-inativar-usuario.response';
import { AtualizarUsuarioResponse } from '../core/responses/usuarios/atualizar-usuario.response';
import { CriarUsuarioResponse } from '../core/responses/usuarios/criar-usuario.response';
import { ObterListaUsuariosIdsResponse } from '../core/responses/usuarios/obter-lista-usuarios-ids.response';
import { ObterUsuarioPorIdResponse } from '../core/responses/usuarios/obter-usuario-por-id.response';
import { ObterUsuariosPaginationResponse } from '../core/responses/usuarios/obter-usuarios-pagination.response';
import { IUsuariosService } from './interfaces/usuarios.interface.service';

@Injectable()
export class UsuariosService implements IUsuariosService {
  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApiADM}usuarios`;

  criarUsuario(usuario: Usuario) {
    return this.http
      .post(this.api, usuario)
      .pipe(map((data) => this.transformToCriarUsuarioResponse(data)));
  }

  atualizarUsuario(usuarioGuid: string, usuario: Usuario) {
    let url = `${this.api}/${usuarioGuid}`;

    return this.http
      .put(url, usuario)
      .pipe(map((data) => this.transformToAtualizarUsuarioResponse(data)));
  }

  obterUsuarios(
    filtro: UsuariosFiltro,
    sort: string = ''
  ): Observable<ObterUsuariosPaginationResponse> {
    let params = new HttpParams().set('sort', sort);
    Object.keys(filtro).forEach((key) => {
      if (filtro[key] !== '' || filtro[key].length !== 0) {
        if (key == 'usuarioId') {
          filtro[key].forEach((value) => {
            params = params.append(key, value);
          });
        } else params = params.append(key, filtro[key]);
      }
    });

    return this.http
      .get<ObterUsuariosPaginationResponse>(this.api, { params: params })
      .pipe(map((data) => this.transformToObterUsuariosResponse(data)));
  }

  obterUsuarioPorId(usuarioId: string) {
    const params = new HttpParams().set('usuarioId', usuarioId);

    return this.http
      .get<ObterUsuarioPorIdResponse>(this.api, { params: params })
      .pipe(map((data) => this.transformToObterUsuarioPorIdResponse(data)));
  }

  obterUsuarioPorListaIds(listaUsuarioId: number[]) {
    let params = new HttpParams();

    listaUsuarioId.forEach(u => {
      params = params.append('usuarioId', u)
    });

    return this.http
      .get<ObterListaUsuariosIdsResponse>(this.api, { params: params })
      .pipe(map((data) => this.transformToObterUsuariosPorIdsResponse(data)));
  }

  obterUsuarioPorGuid(usuarioGuid: string) {
    let url = `${this.api}/usuario/${usuarioGuid}`;

    return this.http
      .get<ObterUsuarioPorIdResponse>(url)
      .pipe(map((data) => this.transformToObterUsuarioPorGuidResponse(data)));
  }

  ativarUsuario(usuarioId: string): Observable<AtivarInativarUsuarioResponse> {
    let url = `${this.api}/${usuarioId}/ativar`;

    return this.http
      .put<AtivarInativarUsuarioResponse>(url, null)
      .pipe(map((data) => this.transformToAtivarInativarUsuarioResponse(data)));
  }

  inativarUsuario(
    usuarioId: string
  ): Observable<AtivarInativarUsuarioResponse> {
    let url = `${this.api}/${usuarioId}/inativar`;

    return this.http
      .delete<AtivarInativarUsuarioResponse>(url)
      .pipe(map((data) => this.transformToAtivarInativarUsuarioResponse(data)));
  }

  //#region Private

  private transformToCriarUsuarioResponse(data: any): CriarUsuarioResponse {
    let response: CriarUsuarioResponse = new CriarUsuarioResponse();

    if (data.isSuccessful) {
      response = data.result;

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToObterUsuariosResponse(
    data: any
  ): ObterUsuariosPaginationResponse {
    let response: ObterUsuariosPaginationResponse =
      new ObterUsuariosPaginationResponse();

    if (data.isSuccessful) {
      response.totalItems = data.result.totalItems;
      response.usuarios = data.result.usuarios;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToAtualizarUsuarioResponse(
    data: any
  ): AtualizarUsuarioResponse {
    let response: AtualizarUsuarioResponse = new AtualizarUsuarioResponse();

    if (data.isSuccessful) {
      response = data.result;

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToObterUsuarioPorIdResponse(
    data: any
  ): ObterUsuarioPorIdResponse {
    let response: ObterUsuarioPorIdResponse = new ObterUsuarioPorIdResponse();

    if (data.isSuccessful) {
      response = data.result.usuarios[0];
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToObterUsuarioPorGuidResponse(data: any): ObterUsuarioPorIdResponse {
    let response: ObterUsuarioPorIdResponse = new ObterUsuarioPorIdResponse();

    if (data.isSuccessful) {
      response = data.result;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToObterUsuariosPorIdsResponse(data: any): ObterListaUsuariosIdsResponse {
    let response: ObterListaUsuariosIdsResponse = new ObterListaUsuariosIdsResponse();

    if (data.isSuccessful) {
      response.usuarios = data.result.usuarios;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToAtivarInativarUsuarioResponse(
    data: any
  ): AtivarInativarUsuarioResponse {
    let response: AtivarInativarUsuarioResponse =
      new AtivarInativarUsuarioResponse();

    if (data.isSuccessful) {
      response.usuarioGuid = data.result.usuarioGuid;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  //#endregion
}
