import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AppSettings } from 'src/app/configs/app-settings.config';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { CriarUsuarioEmpresaRequest } from '../core/requests/empresas/criar-usuario-empresa.request';
import { AtualizarUsuarioEmpresaResponse } from '../core/responses/empresas/atualizar-usuario-empresa.response';
import { CriarUsuarioEmpresaResponse } from '../core/responses/empresas/criar-usuario-empresa.response';
import { ObterUsuariosEmpresaPaginationResponse } from '../core/responses/empresas/obter-usuarios-empresa-pagination.response';
import { IUsuariosEmpresaService } from './interfaces/usuarios-empresa.interface.service';

import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AtualizarSenhaRequest } from '../../../core/requests/atualizar-senha.request';
import { AtualizarUsuarioResponse } from '../../admin/core/responses/usuarios/atualizar-usuario.response';
import { UsuarioEmpresaFiltro } from '../core/models/usuarios-empresa/usuario-empresa-filtro.model';
import { ConvidarUsuarioRequest } from '../core/requests/usuarios/convidar-usuario.request';
import { ObterUsuariosOnlineRequest } from '../core/requests/usuarios/obter-usuarios-online.request';
import { ObterGrupoEconomicoUsuariosResponse } from '../core/responses/grupos-economicos/obter-grupo-economico-usuarios.response';
import { AtivarInativarUsuarioResponse } from '../core/responses/usuarios-empresa/ativar-inativar-usuario.response';
import { CriarUsuarioConvidadoResponse } from '../core/responses/usuarios-empresa/criar-usuario-convidado.response';
import { ExcluirUsuarioConvidadoResponse } from '../core/responses/usuarios-empresa/excluir-usuario-convidado.response';
import { ObterEmailsResponse } from '../core/responses/usuarios-empresa/obter-emails.response';
import { ObterEmpresasGrupoEconomicoResponse } from '../core/responses/usuarios-empresa/obter-empresas-grupo-economico.response';
import { ObterPerfisConvidadosResponse } from '../core/responses/usuarios-empresa/obter-perfis-convidados.response';
import { ObterUsuarioConvidadoResponse } from '../core/responses/usuarios-empresa/obter-usuario-convidado.response';
import { ObterUsuarioPorEmailResponse } from '../core/responses/usuarios-empresa/obter-usuario-por-email.response';
import { ObterUsuarioPorGuidResponse } from '../core/responses/usuarios-empresa/obter-usuario-por-guid.response';
import { ObterUsuariosConvidadosPaginationResponse } from '../core/responses/usuarios-empresa/obter-usuarios-convidados-pagination';
import { ObterUsuariosOnlineResponse } from '../core/responses/usuarios-empresa/obter-usuarios-online.response';
import { ResetarSenhaUsuarioResponse } from '../core/responses/usuarios-empresa/resetar-senha-usuario.response';
import { TransferirUsuarioResponse } from '../core/responses/usuarios-empresa/transferir-usuario.response';

@Injectable()
export class UsuariosEmpresaService implements IUsuariosEmpresaService {
  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApiCRM}usuarios`;

  private _email: BehaviorSubject<string> = new BehaviorSubject(null);
  public email$ = this._email.asObservable().pipe(filter(email => !!email));

  /**
   * 
   * @param email (Retorno do e-mail, para limpar, envie como 'nodata')
   */
  setEmail(email: any): void { this._email.next(email) }

  criarUsuarioEmpresa(usuario: CriarUsuarioEmpresaRequest) {
    return this.http
      .post<CriarUsuarioEmpresaResponse>(this.api, usuario)
      .pipe(map((data) => this.transformToCriarUsuarioEmpresaResponse(data)));
  }

  criarUsuarioMaster(usuario: CriarUsuarioEmpresaRequest) {
    return this.http
      .post<CriarUsuarioEmpresaResponse>(this.api, usuario)
      .pipe(map((data) => this.transformToCriarUsuarioEmpresaResponse(data)));
  }

  obterUsuarios(
    empresaId: number,
    pageIndex: number = 0,
    pageSize: number = 5,
    sort: string = '',
    filtro: UsuarioEmpresaFiltro = null,
    anonimizar: boolean = true
  ): Observable<ObterUsuariosEmpresaPaginationResponse> {
    let url = `${this.api}/${empresaId}`;

    let params = new HttpParams()
      .set('empresaId', empresaId)
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize)
      .set('sort', sort)
      .set('anonimizar', anonimizar);

    if (filtro) {
      Object.keys(filtro).forEach((key) => {
        if (filtro[key] && key == "usuarioGuid") {
          filtro[key].forEach(value => { params = params.append(key, value) });
        }
        else if (filtro[key] !== '' || filtro[key].length !== 0) params = params.append(key, filtro[key])
      });
    }

    return this.http
      .get<ObterUsuariosEmpresaPaginationResponse>(url, { params: params })
      .pipe(map((data) => this.transformToObterUsuariosEmpresaResponse(data)));
  }

  obterUsuarioPorGuid(usuarioGuid: string, empresaId: number, anonimizar: boolean = true) {
    let url = `${this.api}/${usuarioGuid}`;

    const params = new HttpParams()
      .set('empresaId', empresaId)
      .set('anonimizar', anonimizar);

    return this.http.get<ObterUsuarioPorGuidResponse>(url, { params: params })
      .pipe(map(data => this.transformToObterUsuarioPorGuid(data)));
  }

  atualizarUsuario(usuarioGuid: string, usuario: CriarUsuarioEmpresaRequest) {
    let url = `${this.api}/${usuarioGuid}`;

    return this.http
      .put<AtualizarUsuarioEmpresaResponse>(url, usuario)
      .pipe(
        map((data) => this.transformToAtualizarUsuarioEmpresaResponse(data))
      );
  }

  obterUsuarioMaster(empresaId: number, anonimizar: boolean = true) {
    let url = `${this.api}/${empresaId}/usuario-master`;

    const params = new HttpParams()
      .set('anonimizar', anonimizar);

    return this.http.get(url, { params: params })
      .pipe(map(data => this.transformToObterUsuarioMaster(data)));
  }

  ativarUsuario(usuarioGuid: string): Observable<AtivarInativarUsuarioResponse> {
    let url = `${this.api}/${usuarioGuid}/ativar`;

    return this.http.put<AtivarInativarUsuarioResponse>(url, null)
      .pipe(map(data => this.transformToAtivarInativarUsuario(data)));
  }

  inativarUsuario(usuarioGuid: string) {
    let url = `${this.api}/${usuarioGuid}/inativar`;

    return this.http.delete<AtivarInativarUsuarioResponse>(url)
      .pipe(map(data => this.transformToAtivarInativarUsuario(data)));
  }

  obterEmails(empresaId: number) {
    let url = `${this.api}/${empresaId}/usuarios-email`;

    return this.http.get<ObterEmailsResponse>(url)
      .pipe(map(data => this.transformToObterEmails(data)));
  }

  resetarSenha(usuarioGuid: string) {
    let url = `${this.api}/${usuarioGuid}/reset-senha`;
    let body = {}

    return this.http.put<ResetarSenhaUsuarioResponse>(url, body)
      .pipe(map(data => this.transformToResetarSenhaUsuario(data)));
  }

  obterUsuariosConvidados(grupoEconomicoId: number, filtro: any) {
    let url = `${this.api}/convidados/grupo-economico/${grupoEconomicoId}`;

    let params = new HttpParams();
    Object.keys(filtro).forEach((key) => {
      if (filtro[key] && (key == "empresaId" || key == "perfilId" || key == 'usuarioIdConvidado')) {
        filtro[key].forEach(value => { params = params.append(key, value) });
      }
      else if (filtro[key] !== '' || filtro[key].length !== 0) params = params.append(key, filtro[key])
    });

    return this.http.get<ObterUsuariosConvidadosPaginationResponse>(url, { params: params })
      .pipe(map(data => this.transformToObterUsuarioConvidadosResponse(data)));
  }

  obterPerfisConvidados(empresaId: number) {
    let url = `${this.api}/convidados/empresa/${empresaId}/perfis`;

    return this.http.get<ObterPerfisConvidadosResponse>(url)
      .pipe(map(data => this.transformToObterPerfisConvidadosResponse(data)));
  }

  obterUsuariosGrupoEconomico(grupoEconomicoId: number, empresaId: number): Observable<ObterGrupoEconomicoUsuariosResponse> {
    let url = `${this.api}/convidados/grupo-economico/${grupoEconomicoId}/empresa/${empresaId}`;

    return this.http.get<ObterGrupoEconomicoUsuariosResponse>(url)
      .pipe(map(data => this.transformToObterGrupoEconomicoUsuariosResponse(data)));
  }

  criarUsuarioConvidado(convidarUsuarioRequest: ConvidarUsuarioRequest) {
    let url = `${this.api}/convidados-grupo-economico`;

    return this.http.post<CriarUsuarioConvidadoResponse>(url, convidarUsuarioRequest)
      .pipe(map(data => this.transformToCriarUsuarioConvidadoResponse(data)));
  }

  atualizarUsuarioConvidado(convidarUsuarioRequest: ConvidarUsuarioRequest) {
    let url = `${this.api}/convidados-grupo-economico`;

    return this.http.put<CriarUsuarioConvidadoResponse>(url, convidarUsuarioRequest)
      .pipe(map(data => this.transformToCriarUsuarioConvidadoResponse(data)));
  }

  excluirUsuarioConvidado(usuarioConvidadoId: number) {
    let url = `${this.api}/convidados/${usuarioConvidadoId}`;

    return this.http.delete<ExcluirUsuarioConvidadoResponse>(url)
      .pipe(map(data => this.transformToExcluirUsuarioConvidadoResponse(data)));
  }

  obterUsuarioConvidado(usuarioConvidadoId: number) {
    let url = `${this.api}/convidados/${usuarioConvidadoId}`;

    return this.http.get<ObterUsuarioConvidadoResponse>(url)
      .pipe(map(data => this.transformToObterUsuarioConvidadoResponse(data)));
  }

  obterEmpresasGrupoEconomico(empresaId: number) {
    let url = `${this.appSettings.baseUrlApiCRM}empresas/${empresaId}/grupo-economico`;

    return this.http.get<ObterEmpresasGrupoEconomicoResponse>(url)
      .pipe(map(data => this.transformToObterEmpresasGrupoEconomicoResponse(data)));
  }

  trocarSenha(atualizarSenha: AtualizarSenhaRequest) {
    let url = `${this.api}/atualizar-senha`;

    return this.http.put<AtualizarUsuarioResponse>(url, atualizarSenha)
      .pipe(map(data => this.transformToAtualizarSenha(data)));
  }

  obterUsuarioPorEmail(email: string): Observable<ObterUsuarioPorEmailResponse> {
    let params = { email: email };

    return this.http.get<ObterUsuarioPorEmailResponse>(this.api, { params })
      .pipe(map(data => this.transformToObterUsuarioPorEmail(data)));
  }

  transferirUsuario(usuarioGuid: string, empresaId: number) {
    let url = `${this.api}/transferencia-usuario/${usuarioGuid}/empresa/${empresaId}`;

    return this.http.post(url, null)
      .pipe(map(data => this.transformToTransferirUsuarioResponse(data)));
  }

  obterUsuariosOnline() {
    const url = `${this.api}/lista-usuario-autenticados/backoffice`;
    let body: ObterUsuariosOnlineRequest = new ObterUsuariosOnlineRequest();

    return this.http.post<ObterUsuariosOnlineResponse>(url, body)
      .pipe(map(data => this.transformToObterUsuariosOnlineResponse(data)));
  }

  //#region Privates

  private transformToObterUsuariosEmpresaResponse(
    data: any
  ): ObterUsuariosEmpresaPaginationResponse {
    let response: ObterUsuariosEmpresaPaginationResponse =
      new ObterUsuariosEmpresaPaginationResponse();

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

  private transformToCriarUsuarioEmpresaResponse(
    data: any
  ): CriarUsuarioEmpresaResponse {
    let response: CriarUsuarioEmpresaResponse =
      new CriarUsuarioEmpresaResponse();

    if (data.isSuccessful) {
      response = <CriarUsuarioEmpresaResponse>{
        nome: data.result.nome,
        usuarioGuid: data.result.usuarioGuid,
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });

    return response;
  }

  private transformToAtualizarUsuarioEmpresaResponse(
    data: any
  ): AtualizarUsuarioEmpresaResponse {
    let response: AtualizarUsuarioEmpresaResponse =
      new AtualizarUsuarioEmpresaResponse();

    if (data.isSuccessful) {
      response = <AtualizarUsuarioEmpresaResponse>{
        usuarioId: data.result.usuarioId,
        primeiroNome: data.result.primeiroNome,
        sobrenome: data.result.sobrenome,
        email: data.result.email,
        perfilId: data.result.perfilId,
        departamentoId: data.result.departamentoId,
        cargoId: data.result.cargoId,
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });

    return response;
  }

  private transformToObterUsuarioPorGuid(data: any): ObterUsuarioPorGuidResponse {
    let response: ObterUsuarioPorGuidResponse = new ObterUsuarioPorGuidResponse();

    if (data.isSuccessful) {
      response = <ObterUsuarioPorGuidResponse>{
        id: data.result.id,
        perfil: data.result.perfil,
        usuarioGuid: data.result.usuarioGuid,
        primeiroNome: data.result.primeiroNome,
        sobrenome: data.result.sobrenome,
        nomeCompleto: data.result.nomeCompleto,
        documento: data.result.documento,
        email: data.result.email,
        ativo: data.result.ativo,
        recebeComunicados: data.result.recebeComunicados,
        telefone: data.result.telefone,
        ramal: data.result.ramal,
        departamentoId: data.result.departamentoId,
        cargoId: data.result.cargoId,
        criadoEm: data.result.criadoEm,
        modificadoEm: data.result.modificadoEm,
        notificaFaturamento: data.result?.notificaFaturamento
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });

    return response;
  }

  private transformToObterUsuarioMaster(data: any): ObterUsuarioPorGuidResponse {
    let response: ObterUsuarioPorGuidResponse = new ObterUsuarioPorGuidResponse();

    if (data.isSuccessful) {
      response = <ObterUsuarioPorGuidResponse>{
        id: data.result.id,
        perfil: data.result.perfil,
        usuarioGuid: data.result.usuarioGuid,
        primeiroNome: data.result.primeiroNome,
        sobrenome: data.result.sobrenome,
        nomeCompleto: data.result.nomeCompleto,
        documento: data.result.documento,
        email: data.result.email,
        ativo: data.result.ativo,
        telefone: data.result.telefone,
        ramal: data.result.ramal,
        departamentoId: data.result.departamentoId,
        cargoId: data.result.cargoId,
        recebeComunicados: data.result.recebeComunicados,
        criadoEm: data.result.criadoEm,
        modificadoEm: data.result.modificadoEm,
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });

    return response;
  }

  private transformToAtivarInativarUsuario(data: any): AtivarInativarUsuarioResponse {
    let response: AtivarInativarUsuarioResponse = new AtivarInativarUsuarioResponse();

    if (data.isSuccessful) {
      response.usuarioGuid = data.result.usuarioGuid;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });

    return response;
  }

  private transformToObterEmails(data: any): ObterEmailsResponse {
    let response: ObterEmailsResponse = new ObterEmailsResponse();

    if (data.isSuccessful) {
      response.emails = data.result.emails;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });

    return response;
  }

  private transformToResetarSenhaUsuario(data: any): ResetarSenhaUsuarioResponse {
    let response: ResetarSenhaUsuarioResponse = new ResetarSenhaUsuarioResponse();

    if (data.isSuccessful) {
      response.usuarioGuid = data.result.usuarioGuid;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });

    return response;
  }

  private transformToObterUsuarioConvidadosResponse(data: any): ObterUsuariosConvidadosPaginationResponse {
    let response: ObterUsuariosConvidadosPaginationResponse = new ObterUsuariosConvidadosPaginationResponse()

    if (data.isSuccessful) {
      response.totalItems = data.result.totalItems;
      response.usuarios = data.result.usuarios;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToObterPerfisConvidadosResponse(data: any): ObterPerfisConvidadosResponse {
    let response: ObterPerfisConvidadosResponse = new ObterPerfisConvidadosResponse()

    if (data.isSuccessful) {
      response.perfis = data.result.perfis;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToCriarUsuarioConvidadoResponse(data: any): CriarUsuarioConvidadoResponse {
    let response: CriarUsuarioConvidadoResponse = new CriarUsuarioConvidadoResponse()

    if (data.isSuccessful) {
      response = data.result;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToExcluirUsuarioConvidadoResponse(data: any): ExcluirUsuarioConvidadoResponse {
    let response: ExcluirUsuarioConvidadoResponse = new ExcluirUsuarioConvidadoResponse()

    if (data.isSuccessful) {
      response = data.result;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToObterUsuarioConvidadoResponse(data: any): ObterUsuarioConvidadoResponse {
    let response: ObterUsuarioConvidadoResponse = new ObterUsuarioConvidadoResponse()

    if (data.isSuccessful) {
      response = data.result;
      response.usuarioId = data.result.usuarioId;
      response.nomeUsuario = data.result.nomeUsuario;
      response.tipoExterno = data.result.tipoExterno;
      response.nomeEmpresaOrigem = data.result.nomeEmpresaOrigem;
      response.empresaIdOrigem = data.result.empresaIdOrigem;
      response.perfilId = data.result.perfilId;
      response.nomeEmpresaConvidado = data.result.nomeEmpresaConvidado;
      response.empresaIdConvidado = data.result.empresaIdConvidado;
      response.ativo = data.result.ativo;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToObterEmpresasGrupoEconomicoResponse(data: any): ObterEmpresasGrupoEconomicoResponse {
    let response: ObterEmpresasGrupoEconomicoResponse = new ObterEmpresasGrupoEconomicoResponse()

    if (data.isSuccessful) {
      response.empresas = data.result.empresas;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToObterGrupoEconomicoUsuariosResponse(data: any): ObterGrupoEconomicoUsuariosResponse {
    let response: ObterGrupoEconomicoUsuariosResponse = new ObterGrupoEconomicoUsuariosResponse();

    if (data.isSuccessful) {
      response.usuariosConvidados = data.result.usuariosConvidados;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToAtualizarSenha(data: any): AtualizarUsuarioResponse {
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

  private transformToObterUsuarioPorEmail(data: any): ObterUsuarioPorEmailResponse {
    let response: ObterUsuarioPorEmailResponse = new ObterUsuarioPorEmailResponse();

    if (data.isSuccessful) {
      response = data.result;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });

    return response;
  }

  private transformToTransferirUsuarioResponse(data: any): TransferirUsuarioResponse {
    let response: TransferirUsuarioResponse = new TransferirUsuarioResponse();

    if (data.isSuccessful) {
      response.usuarioGuid = data.result.usuarioGuid;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });

    return response;
  }

  private transformToObterUsuariosOnlineResponse(data: any): ObterUsuariosOnlineResponse {
    let response: ObterUsuariosOnlineResponse = new ObterUsuariosOnlineResponse()
    
    if (data.isSuccessful) {
      response.usuarios = data.result.listaUsuariosLogados;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });

    return response;
  }
  //#endregion
}
