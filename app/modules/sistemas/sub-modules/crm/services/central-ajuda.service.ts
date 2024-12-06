import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { Observable } from 'rxjs';
import { ICentralAjudaService } from './interfaces/central-ajuda.interface.service';
import { ObterSecoesPaginadoResponse } from '../core/responses/central-ajuda/obter-secoes-paginado.response';
import { CriarSecaoRequest } from '../core/requests/central-ajuda/criar-secao.request';
import { CriarSecaoResponse } from '../core/responses/central-ajuda/criar-secao.response';
import { ObterSecaoPorIdResponse } from '../core/responses/central-ajuda/obter-secao-por-id.response';
import { AtivarInativarSecaoResponse } from '../core/responses/central-ajuda/ativar-inativar-secao.response';
import { ObterArtigosPaginadoResponse } from '../core/responses/central-ajuda/obter-artigos-paginado.response';
import { CriarArtigoRequest } from '../core/requests/central-ajuda/criar-artigos.request';
import { CriarArtigoResponse } from '../core/responses/central-ajuda/criar-artigo.response';
import { ObterArtigoPorIdResponse } from '../core/responses/central-ajuda/obter-artigo-por-id.response';
import { AtivarInativarArtigoResponse } from '../core/responses/central-ajuda/ativar-inativar-artigo.response';
import { SecoesFiltro } from '../core/models/central-ajuda/secoes-filtro';
import { EditarArtigoResponse } from '../core/responses/central-ajuda/editar-artigo.response';
import { ObterArtigosPorSecaoResponse } from '../core/responses/central-ajuda/obter-artigos-por-secao.response';
import { AlterarPosicaoArtigoResponse } from '../core/responses/central-ajuda/alterar-posicao-artigo.response';
import { ArtigosFiltro } from '../core/models/central-ajuda/artigos-filtro';

@Injectable({
  providedIn: 'root'
})
export class CentralAjudaService implements ICentralAjudaService {
  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApiCRM}faq`;

  obterSecoesPaginado(filtro: SecoesFiltro = null): Observable<ObterSecoesPaginadoResponse> {
    let url = `${this.api}/lista-secao`;

    let params = new HttpParams()
      .set('pageIndex', filtro.pageIndex)
      .set('pageSize', filtro.pageSize);

    if (filtro) {
      Object.keys(filtro).forEach((key) => {
        if (filtro[key]) {
          if (filtro[key]?.length !== 0) {
            if (key === 'secaoId' || key === 'status' || key === 'usuarioGuid') {
              filtro[key].forEach((value) => {
                params = params.append(key, value);
              });
            }
            else { params = params.append(key, filtro[key]) }
          }
        }
      })
    }

    return this.http.get<ObterSecoesPaginadoResponse>(url, { params: params })
      .pipe(map(data => this.transformToObterSecoesPaginadoResponse(data)));
  }

  criarSecao(secao: CriarSecaoRequest) {
    let url = `${this.api}/secao`;

    return this.http
      .post<CriarSecaoResponse>(url, secao)
      .pipe(map((data) => this.transformToCriarSecaoResponse(data)));
  }

  obterSecaoPorId(secaoId: number): Observable<ObterSecaoPorIdResponse> {
    let url = `${this.api}/secao/${secaoId}`;

    return this.http.get<ObterSecaoPorIdResponse>(url)
      .pipe(map((data) => this.transformToObterSecaoPorId(data)));
  }

  editarSecao(secaoId: number, secao: CriarSecaoRequest) {
    let url = `${this.api}/secao/${secaoId}`;

    return this.http
      .put<CriarSecaoResponse>(url, secao)
      .pipe(map((data) => this.transformToCriarSecaoResponse(data)));
  }

  desarquivarSecao(secaoId: number) {
    let url = `${this.api}/secao/${secaoId}/desarquivar`;

    return this.http.put<AtivarInativarSecaoResponse>(url, null)
      .pipe(map(data => this.transformToAtivarInativarSecao(data)));
  }

  arquivarSecao(secaoId: number): Observable<AtivarInativarSecaoResponse> {
    let url = `${this.api}/secao/${secaoId}/arquivar`;

    return this.http.delete<AtivarInativarSecaoResponse>(url)
      .pipe(map(data => this.transformToAtivarInativarSecao(data)));
  }

  obterArtigosPorSecao(secaoId: number) {
    let url = `${this.api}/secao/${secaoId}/artigo`;

    return this.http.get<ObterArtigosPorSecaoResponse>(url)
      .pipe(map(data => this.transformToObterArtigosPorSecao(data)));
  }

  //#region Privates
  private transformToObterSecoesPaginadoResponse(data: any): ObterSecoesPaginadoResponse {
    let response: ObterSecoesPaginadoResponse = new ObterSecoesPaginadoResponse()

    if (data.isSuccessful) {
      response.totalItems = data.result.totalItems;
      response.listaSecao = data.result.listaSecao;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToCriarSecaoResponse(data: any): CriarSecaoResponse {
    let response: CriarSecaoResponse = new CriarSecaoResponse();

    if (data.isSuccessful) {
      response = <CriarSecaoResponse>{
        id: data.result.id
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToObterSecaoPorId(data: any): ObterSecaoPorIdResponse {
    let response: ObterSecaoPorIdResponse = new ObterSecaoPorIdResponse();

    if (data.isSuccessful) {
      response = <ObterSecaoPorIdResponse>{
        id: data.result.id,
        titulo: data.result.titulo,
        descricao: data.result.descricao
      }
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToAtivarInativarSecao(data: any): AtivarInativarSecaoResponse {
    let response: AtivarInativarSecaoResponse = new AtivarInativarSecaoResponse()

    if (data.isSuccessful) {
      response = data.result;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;

  }
  private transformToObterArtigosPorSecao(data: any): ObterArtigosPorSecaoResponse {
    let response: ObterArtigosPorSecaoResponse = new ObterArtigosPorSecaoResponse()

    if (data.isSuccessful) {
      response.artigos = data.result.artigos;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }
  //#endregion

  //#endregion

  //#region Artigos
  obterArtigosPaginado(filtro: ArtigosFiltro): Observable<ObterArtigosPaginadoResponse> {
    let url = `${this.api}/lista-artigo`;

    let params = new HttpParams()
      .set('pageIndex', filtro.pageIndex)
      .set('pageSize', filtro.pageSize);

    if (filtro) {
      Object.keys(filtro).forEach((key) => {
        if (filtro[key]) {
          if (filtro[key]?.length !== 0) {
            if (key === 'secaoId' || key === 'artigoId' || key === 'statusArtigos' || key === 'usuarios') {
              filtro[key].forEach((value) => {
                params = params.append(key, value);
              });
            }
            else { params = params.append(key, filtro[key]) }
          }
        }
      })
    }

    return this.http.get<ObterArtigosPaginadoResponse>(url, { params: params })
      .pipe(map(data => this.transformToObterArtigosPaginadoResponse(data)));
  }

  criarArtigo(secao: CriarArtigoRequest) {
    let url = `${this.getArtigoUrl()}`;

    return this.http
      .post<CriarArtigoResponse>(url, secao)
      .pipe(map((data) => this.transformToCriarArtigoResponse(data)));
  }

  obterArtigoPorId(artigoId: number): Observable<ObterArtigoPorIdResponse> {
    let url = `${this.getArtigoUrl()}/${artigoId}`;

    return this.http.get<ObterArtigoPorIdResponse>(url)
      .pipe(map((data) => this.transformToObterArtigoPorId(data)));
  }

  editarArtigo(artigoId: number, artigo: CriarArtigoRequest) {
    let url = `${this.getArtigoUrl()}/${artigoId}`;

    return this.http
      .put<EditarArtigoResponse>(url, artigo)
      .pipe(map((data) => this.transformToEditarArtigoResponse(data)));
  }

  desarquivarArtigo(artigoId: number) {
    let url = `${this.getArtigoUrl()}/${artigoId}/desarquivar`;

    return this.http.put<AtivarInativarArtigoResponse>(url, null)
      .pipe(map(data => this.transformToAtivarInativarSecao(data)));
  }

  arquivarArtigo(artigoId: number): Observable<AtivarInativarArtigoResponse> {
    let url = `${this.getArtigoUrl()}/${artigoId}/arquivar`;

    return this.http.delete<AtivarInativarArtigoResponse>(url)
      .pipe(map(data => this.transformToAtivarInativarArtigo(data)));
  }

  alterarPosicaoArtigo(request: ObterArtigosPorSecaoResponse) {
    let url = `${this.getArtigoUrl()}/posicao`;

    return this.http.put(url, request)
      .pipe(map(data => this.transformToAlterarPosicaoArtigoResponse(data)));
  }

  //#region Privates
  private getArtigoUrl(): string {
    return `${this.api}/secao/artigo`;
  }
  private transformToObterArtigosPaginadoResponse(data: any): ObterArtigosPaginadoResponse {
    let response: ObterArtigosPaginadoResponse = new ObterArtigosPaginadoResponse()

    if (data.isSuccessful) {
      response.totalItems = data.result.totalItems;
      response.listaArtigos = data.result.listaArtigos;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToCriarArtigoResponse(data: any): CriarArtigoResponse {
    let response: CriarArtigoResponse = new CriarArtigoResponse();

    if (data.isSuccessful) {
      response = <CriarArtigoResponse>{
        artigoId: data.result.artigoId
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToEditarArtigoResponse(data: any): EditarArtigoResponse {
    let response: EditarArtigoResponse = new EditarArtigoResponse();

    if (data.isSuccessful) {
      response = <EditarArtigoResponse>{
        id: data.result.id,
        titulo: data.result.titulo,
        posicao: data.result.posicao
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToObterArtigoPorId(data: any): ObterArtigoPorIdResponse {
    let response: ObterArtigoPorIdResponse = new ObterArtigoPorIdResponse();

    if (data.isSuccessful) {
      response = <ObterArtigoPorIdResponse>{
        id: data.result.id,
        conteudoComplementar: data.result.conteudoComplementar,
        listaArquivos: data.result.listaArquivos,
        posicao: data.result.posicao,
        secaoId: data.result.secaoId,
        statusArtigo: data.result.statusArtigo,
        titulo: data.result.titulo,
        urlVideo: data.result.urlVideo,
      }
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToAtivarInativarArtigo(data: any): AtivarInativarArtigoResponse {
    let response: AtivarInativarArtigoResponse = new AtivarInativarArtigoResponse()

    if (data.isSuccessful) {
      response = data.result;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToAlterarPosicaoArtigoResponse(data: any): AlterarPosicaoArtigoResponse {
    let response: AlterarPosicaoArtigoResponse = new AlterarPosicaoArtigoResponse()

    if (data.isSuccessful) {
      response.id = data.result.id;
      response.posicao = data.result.posicao;
      response.titulo = data.result.titulo;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }
  //#endregion

  //#endregion
}
