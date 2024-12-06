import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { MapaDetransResponse } from '../core/responses/conexao-detrans/mapa-detrans.response';
import { INotificacaoService } from './interfaces/notificacao.interface.service';
import { Observable } from 'rxjs';
import { ObterNotificacoesPaginationResponse } from '../core/responses/notificacao/obter-notificacoes-paginado.response';
import { NotificacaoRequest } from '../core/requests/notificacao/notificacao.request';
import { CriarNotificacaoResponse } from '../core/responses/notificacao/criar-notificacao.response';
import { ObterNotificacaoPorIdResponse } from '../core/responses/notificacao/obter-notificacao-por-id.response';
import { AtivarInativarNotificacaoResponse } from '../core/responses/notificacao/ativar-inativar-notificacao.response';

@Injectable({
  providedIn: 'root'
})
export class NotificacoesService implements INotificacaoService {
  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApiCRM}notificacoes`;

  obterMapaDetrans() {
    let url = `${this.api}/mapa-detrans`;

    return this.http.get<MapaDetransResponse>(url)
      .pipe(map(data => this.transformToMapaDetransResponse(data)));
  }

  obterNotificacoesPaginado(pageIndex: number = 0, pageSize: number = 25, filtro: any = '', sort: string = ''): Observable<ObterNotificacoesPaginationResponse> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize)

    if (filtro) {
      Object.keys(filtro).forEach((key) => {
        if (filtro[key]) {
          if (key == 'categoriaId' || key == 'statusNotificacaoId' ||  key === 'usuarioGuid' || key === 'tituloId') {
            filtro[key].forEach((value) => {
              params = params.append(key, value);
            });
          } else {
            params = params.append(key, filtro[key])
          }
        }
      })
    };

    return this.http.get<ObterNotificacoesPaginationResponse>(this.api, { params: params })
      .pipe(map(data => this.transformToObterNotificacoesPaginationResponse(data)));
  }

  criarNotificacao(notificacao: NotificacaoRequest) {
    return this.http
      .post<CriarNotificacaoResponse>(this.api, notificacao)
      .pipe(map((data) => this.transformToCriarNotificacaoResponse(data)));
  }

  obterNotificacaoPorId(notificacaoId: number): Observable<ObterNotificacaoPorIdResponse> {
    let url = `${this.api}/${notificacaoId}/notificacao`;

    return this.http.get<ObterNotificacaoPorIdResponse>(url)
      .pipe(map((data) => this.transformToObterNotificacaoPorId(data)));
  }

  editarNotificacao(notificacaoId: number, notificacao: NotificacaoRequest) {
    let url = `${this.api}/${notificacaoId}`;

    return this.http
      .put<CriarNotificacaoResponse>(url, notificacao)
      .pipe(map((data) => this.transformToCriarNotificacaoResponse(data)));
  }

  ativarNotificacao(notificacaoId: number) {
    let url = `${this.api}/${notificacaoId}/ativar`;

    return this.http.put<AtivarInativarNotificacaoResponse>(url, null)
      .pipe(map(data => this.transformToAtivarInativarNotificacao(data)));
  }

  inativarNotificacao(notificacaoId: number): Observable<AtivarInativarNotificacaoResponse> {
    let url = `${this.api}/${notificacaoId}/inativar`;

    return this.http.delete<AtivarInativarNotificacaoResponse>(url)
      .pipe(map(data => this.transformToAtivarInativarNotificacao(data)));
  }

  //#region Privates
  private transformToMapaDetransResponse(data: any): MapaDetransResponse {
    let response: MapaDetransResponse = new MapaDetransResponse()

    if (data.isSuccessful) {
      response = data.result;

      return response
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName)
    })
  }

  private transformToObterNotificacoesPaginationResponse(data: any): ObterNotificacoesPaginationResponse {
    let response: ObterNotificacoesPaginationResponse = new ObterNotificacoesPaginationResponse()

    if (data.isSuccessful) {
      response.totalItems = data.result.totalItems;
      response.notificacoes = data.result.notificacoes;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToCriarNotificacaoResponse(data: any): CriarNotificacaoResponse {
    let response: CriarNotificacaoResponse = new CriarNotificacaoResponse();

    if (data.isSuccessful) {
      response = <CriarNotificacaoResponse>{
        id: data.result.id
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToObterNotificacaoPorId(data: any): ObterNotificacaoPorIdResponse {
    let response: ObterNotificacaoPorIdResponse = new ObterNotificacaoPorIdResponse();

    if (data.isSuccessful) {
      response = <ObterNotificacaoPorIdResponse>{
        id: data.result.id,
        tipoNotificacao: data.result.tipoNotificacao,
        tipoFrequencia: data.result.tipoFrequencia,
        ehNotificaTodosClientes: data.result.ehNotificaTodosClientes,
        statusNotificacaoId: data.result.statusNotificacaoId,
        titulo: data.result.titulo,
        mensagem: data.result.mensagem,
        categoriaID: data.result.categoriaID,
        urlImagem: data.result.urlImagem,
        nomeArquivoImagem: data.result.nomeArquivoImagem,
        descricaoBotao: data.result.descricaoBotao,
        urlBotao: data.result.urlBotao,
        agendar: data.result.agendar,
        dataAgendamento: data.result.dataAgendamento,
        ativo: data.result.ativo,
        criadoPorNome: data.result.criadoPorNome,
        criadoPorEmail: data.result.criadoPorEmail,
        empresa: data.result.empresa,
        usuarios: data.result.usuarios,
        usuarioGuid: data.result.usuarioGuid,
        dataInicio: data.result.dataInicio,
        dataFim: data.result.dataFim
      }
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToAtivarInativarNotificacao(data: any): AtivarInativarNotificacaoResponse {
    let response: AtivarInativarNotificacaoResponse = new AtivarInativarNotificacaoResponse()

    if (data.isSuccessful) {
      response = data.result;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }
  //#endregion
}
