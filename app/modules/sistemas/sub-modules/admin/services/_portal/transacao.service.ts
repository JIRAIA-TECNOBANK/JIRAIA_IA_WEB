import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AppSettings } from 'src/app/configs/app-settings.config';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { Transacoes } from '../../../crm/core/models/transacoes/transacoes.model';
import { ObterTransacoesPaginationResponse } from '../../core/responses/_portal/transacoes/obter-transacoes-pagination.response';
import { TransacoesDetalhesResponse } from '../../core/responses/_portal/transacoes/transacoes-detalhes.response';
import { TransacoesStatusResponse } from '../../core/responses/_portal/transacoes/transacoes-status.response';
import { TransacoesResponse } from '../../core/responses/_portal/transacoes/transacoes.response';

import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ObterLotesRequest } from '../../core/requests/_portal/transacoes/obter-lotes.request';
import { ReprocessarListaTransacoesRequest } from '../../core/requests/_portal/transacoes/reprocessar-lista-transacoes.request';
import { FiltrarTransacoesRequest } from '../../core/requests/usuarios/transacoes/filtrar-transacoes.request';
import { EnviarLoteResponse } from '../../core/responses/_portal/contrato/enviar-lote.response';
import { ObterDsMensagemResponse } from '../../core/responses/_portal/transacoes/obter-ds-mensagem.response';
import { ObterFlagsElegiveisFaturamentoResponse } from '../../core/responses/_portal/transacoes/obter-flags-elegiveis-faturamento.response';
import { ObterLoteBase64Response } from '../../core/responses/_portal/transacoes/obter-lote-base64.response';
import { ObterLoteResponse } from '../../core/responses/_portal/transacoes/obter-lote.response';
import { ObterLotesResponse } from '../../core/responses/_portal/transacoes/obter-lotes.response';
import { ObterStatusLoteResponse } from '../../core/responses/_portal/transacoes/obter-status-lote.response';
import { ObterStatusTransacoesResponse } from '../../core/responses/_portal/transacoes/obter-status-transacoes.response';
import { ReprocessarListaTransacoesResponse } from '../../core/responses/_portal/transacoes/reprocessar-lista-transacoes.response';
@Injectable({
  providedIn: 'root'
})
export class TransacaoService {

  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  private _filtroOperacoes: BehaviorSubject<FiltrarTransacoesRequest> = new BehaviorSubject(null);
  public filtroOperacoes$ = this._filtroOperacoes.asObservable().pipe(filter(filtro => !!filtro));

  defineFiltroOperacoes(filtro: FiltrarTransacoesRequest): void { this._filtroOperacoes.next(filtro); }

  filtrarTransacoes(filtro, sort: string = '') {
    let url = `${this.appSettings.baseUrlApiPortal}transacoes/backoffice`;

    let params = new HttpParams();
    Object.keys(filtro).forEach((key) => {
      if (key == 'PageIndex' || key == 'PageSize') {
        params = params.append(key, filtro[key])
      }
    });

    return this.http.post<TransacoesResponse>(url, filtro, { params: params })
      .pipe(map(data => this.consultarTransacoesResponse(data)));
  }

  obterStatusTransacoes() {
    let url = `${this.appSettings.baseUrlApiPortal}transacoes/status`;

    return this.http.get<TransacoesStatusResponse>(url)
      .pipe(map(data => this.consultarTransacaoStatusResponse(data)));
  }

  obterStatusTransacao() {
    let url = `${this.appSettings.baseUrlApiPortal}transacoes/status-transacao`;

    return this.http.get<TransacoesStatusResponse>(url)
      .pipe(map(data => this.consultarTransacaoStatusResponse(data)));
  }

  obterDetalhesTransacao(protocolo: string) {
    let url = `${this.appSettings.baseUrlApiPortal}transacoes/backoffice/${protocolo}`;

    return this.http.get<TransacoesDetalhesResponse>(url)
      .pipe(map(data => this.consultarTransacaoDetalhesResponse(data)));
  }

  reprocessarListaTransacoes(protocolosTransacao: ReprocessarListaTransacoesRequest) {
    let url = `${this.appSettings.baseUrlApiPortal}transacoes/reprocessar-lista-transacoes`;

    return this.http.post<ReprocessarListaTransacoesResponse>(url, protocolosTransacao)
      .pipe(map(data => this.reprocessarListaTransacoesResponse(data)));
  }

  enviarLote(base64: string, palavraChave: string, operacao: number, nomeArquivo: string, empresaId: number, nomeEmpresa: string, usuarioGuid: string): Observable<any> {
    let url = this.appSettings.baseUrlApiPortal + `transacoes/${usuarioGuid}/lotes-backoffice`;

    return this.http.post<any>(url, { loteBase64: base64, palavraChave: palavraChave, operacaoId: operacao, nomeArquivo: nomeArquivo, empresaId: empresaId, nomeEmpresa: nomeEmpresa })
      .pipe(map(data => this.transformToEnviarLoteResponse(data)));
  }

  obterLotes(obterLotesRequest: ObterLotesRequest, pageIndex: number = 0, pageSize: number = 25) {
    let url = this.appSettings.baseUrlApiPortal + 'transacoes/resumo-lotes-backoffice';

    const params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize);

    return this.http.post<ObterLotesResponse>(url, obterLotesRequest, { params: params })
      .pipe(map(data => this.transformToObterLotesReponse(data)));
  }

  obterLote(protocolo: string) {
    let url = this.appSettings.baseUrlApiPortal + 'transacoes/' + protocolo + '/lote';

    return this.http.get<any>(url)
      .pipe(map(data => this.transformToObterLoteResponse(data)));
  }

  obterLoteBase64(protocolo: string, tipoArquivo: string) {
    let url = this.appSettings.baseUrlApiPortal + 'transacoes/lote/' + protocolo + '/retorno-processamento/' + tipoArquivo;

    return this.http.get<any>(url)
      .pipe(map(data => this.transformToObterLoteBase64Response(data)));
  }

  obterDsMensagem(protocolo: string): Observable<ObterDsMensagemResponse> {
    let url = `${this.appSettings.baseUrlApiPortal}transacoes/dsmensagem/${protocolo}`;

    return this.http.get<ObterDsMensagemResponse>(url)
      .pipe(map(data => this.transformToObterDsMensagemResponse(data)));
  }

  obterStatusLote(): Observable<ObterStatusLoteResponse> {
    let url = `${this.appSettings.baseUrlApiPortal}transacoes/lote/status`;

    return this.http.get<ObterStatusLoteResponse>(url)
      .pipe(map(data => this.transformToObterStatusLoteResponse(data)));
  }

  obterFlagsElegiveisFaturamento(ufs: string[]) {
    let url = `${this.appSettings.baseUrlApiPortal}transacoes/estados-elegiveis-faturamento`;

    let params = new HttpParams()

    ufs?.forEach(uf => {
      params = params.append('ufs', uf);
    })

    return this.http.get<ObterFlagsElegiveisFaturamentoResponse>(url, { params })
      .pipe(map(data => this.transformToObterFlagsElegiveisFaturamentoResponse(data)));
  }

  private consultarTransacoesResponse(data: any) {
    let response: ObterTransacoesPaginationResponse = new ObterTransacoesPaginationResponse()

    if (data.isSuccessful) {
      response.totalItems = data.result.totalItems;
      response.habilitaEdicao = data.result.habilitaEdicao;
      response.habilitaReenvio = data.result.habilitaReenvio;

      data.result.transacoes.forEach((transacao: Transacoes) => {
        response.transacoes.push(transacao);
      })

      return response
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName)
    });

    return response;
  }

  private consultarTransacaoDetalhesResponse(data: any) {
    let response: any

    if (data.isSuccessful) {
      response = data
      return response
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName)
    })
  }

  private consultarTransacaoStatusResponse(data: any) {
    let response: ObterStatusTransacoesResponse = new ObterStatusTransacoesResponse()

    if (data.isSuccessful) {
      data.result.statusTransacao.forEach((status: any) => {
        response.statusTransacao.push(status);
      })

      return response
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName)
    })
  }

  private reprocessarListaTransacoesResponse(data: any) {
    let response: ReprocessarListaTransacoesResponse = new ReprocessarListaTransacoesResponse();

    if (data.isSuccessful) {
      response.message = data.result.message;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToEnviarLoteResponse(data: any): EnviarLoteResponse {
    let response: EnviarLoteResponse = new EnviarLoteResponse();

    if (data.isSuccessful) {
      response = <EnviarLoteResponse>{
        isSuccessful: true,
        status: data.result.status,
        dataTransacao: data.result.dataTransacao,
        protocoloLote: data.result.protocoloLote
      }

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToObterLotesReponse(data: any): ObterLotesResponse {
    let response: ObterLotesResponse = new ObterLotesResponse();

    if (data.isSuccessful) {
      response = <ObterLotesResponse>{
        pageIndex: data.result.pageIndex,
        totalItems: data.result.totalItems,
        lotes: data.result.lotes
      }

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToObterLoteResponse(data: any): ObterLoteResponse {
    let response: ObterLoteResponse = new ObterLoteResponse();

    if (data.isSuccessful) {
      response = <ObterLoteResponse>{
        usuarioId: data.result.usuarioId,
        protocolo: data.result.protocolo,
        dominioId: data.result.dominioId,
        operacaoId: data.result.operacaoId,
        nomeArquivo: data.result.nomeArquivo,
        url: data.result.url,
        totalLinhas: data.result.totalLinhas,
        statusLoteId: data.result.statusLoteId,
        empresaId: data.result.empresaId,
        criadoEm: data.result.criadoEm,
        modificadoEm: data.result.modificadoEm
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToObterLoteBase64Response(data: any): ObterLoteBase64Response {
    let response: ObterLoteBase64Response = new ObterLoteBase64Response();

    if (data.isSuccessful) {
      response = <ObterLoteBase64Response>{
        loteBase64: data.result.loteBase64,
        nomeArquivo: data.result.nomeArquivo,
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToObterDsMensagemResponse(data: any): ObterDsMensagemResponse {
    let response: ObterDsMensagemResponse = new ObterDsMensagemResponse();

    if (data.isSuccessful) {
      response = <ObterDsMensagemResponse>{
        transacaoProtocoloDsMensagem: data.result.transacaoProtocoloDsMensagem
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToObterStatusLoteResponse(data: any): ObterStatusLoteResponse {
    let response: ObterStatusLoteResponse = new ObterStatusLoteResponse();

    if (data.isSuccessful) {
      response.listaStatusLote = data.result.listaStatusLote;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToObterFlagsElegiveisFaturamentoResponse(data: any): ObterFlagsElegiveisFaturamentoResponse {
    let response: ObterFlagsElegiveisFaturamentoResponse = new ObterFlagsElegiveisFaturamentoResponse();

    if (data.isSuccessful) {
      response.transacaoFaturamento = data.result.transacaoFaturamento;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  getCodigoRetorno(filter: string) {
    let url = this.appSettings.baseUrlApiPortal + 'transacoes/codigo-de-para';
    if (filter) {
      const params = new HttpParams()
        .set('termoPesquisa', filter)
      return this.http.get<any>(url, { params })
    }
    return this.http.get<any>(url)
  }
}
