import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter, map } from 'rxjs';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { AplicarDescontoDados } from '../core/models/faturamento-conciliado/aplicar-desconto-dados.model';
import { FiltroConciliacao } from '../core/models/faturamento-conciliado/filtro-conciliacao.model';
import { FiltroFaturado } from '../core/models/faturamento-conciliado/filtro-faturado.model';
import { AplicarDescontoRequest } from '../core/requests/faturamento-conciliado/aplicar-desconto.request';
import { AprovarConciliacaoRequest } from '../core/requests/faturamento-conciliado/aprovar-conciliacao.request';
import { AprovarFaturamentoRequest } from '../core/requests/faturamento-conciliado/aprovar-faturamento.request';
import { AtualizarObservacaoNotasRequest } from '../core/requests/faturamento-conciliado/atualizar-observacao-notas.request';
import { EditarDescontoRequest } from '../core/requests/faturamento-conciliado/editar-desconto.request';
import { ExcluirCobrancaRequest } from '../core/requests/faturamento-conciliado/excluir-cobranca.request';
import { ExcluirDuplicidadeRequest } from '../core/requests/faturamento-conciliado/excluir-duplicidade.request';
import { RemoverItemConciliacaoRequest } from '../core/requests/faturamento-conciliado/remover-item-conciliacao.resquest';
import { AplicarDescontoResponse } from '../core/responses/faturamento-conciliado/aplicar-desconto.response';
import { AprovarConciliacaoResponse } from '../core/responses/faturamento-conciliado/aprovar-conciliacao.response';
import { AprovarFaturamentoResponse } from '../core/responses/faturamento-conciliado/aprovar-faturamento.response';
import { AtualizarObservacaoNotasResponse } from '../core/responses/faturamento-conciliado/atualizar-observacao-notas.response';
import { BaixarArquivoResponse } from '../core/responses/faturamento-conciliado/baixar-arquivo.response';
import { BaixarKitClienteResponse } from '../core/responses/faturamento-conciliado/baixar-kit-cliente.response';
import { CancelarDescontoResponse } from '../core/responses/faturamento-conciliado/cancelar-desconto.response';
import { EditarDescontoResponse } from '../core/responses/faturamento-conciliado/editar-desconto.response';
import { EmitirEmailResponse } from '../core/responses/faturamento-conciliado/emitir-email.response';
import { ExcluirArquivoConciliacaoResponse } from '../core/responses/faturamento-conciliado/excluir-arquivo-conciliacao.response';
import { ExcluirCobrancaConciliacaoResponse } from '../core/responses/faturamento-conciliado/excluir-cobranca-conciliacao.response';
import { ExcluirDuplicidadeResponse } from '../core/responses/faturamento-conciliado/excluir-duplicidade.response';
import { ExportarTodosArquivosResponse } from '../core/responses/faturamento-conciliado/exportar-todos-arquivos.response';
import { ObterConciliacaoResponse } from '../core/responses/faturamento-conciliado/obter-conciliacao.response';
import { ObterDescontoCadastradoResponse } from '../core/responses/faturamento-conciliado/obter-desconto-cadastrado.response';
import { ObterFaturamentoConciliadoItensResponse } from '../core/responses/faturamento-conciliado/obter-faturamento-conciliado-itens.response';
import { ObterMotivosExclusaoCobrancaResponse } from '../core/responses/faturamento-conciliado/obter-motivos-exclusao-cobranca.response';
import { ObterObservacoesNotasResponse } from '../core/responses/faturamento-conciliado/obter-observacoes-notas.response';
import { ObterStatusMotivoResponse } from '../core/responses/faturamento-conciliado/obter-status-motivo.response';
import { PesquisarItemConciliacaoResponse } from '../core/responses/faturamento-conciliado/pesquisar-item-conciliacao.response';
import { ReconciliarArquivoResponse } from '../core/responses/faturamento-conciliado/reconciliar-arquivo.response';
import { ReenvioNotasResponse } from '../core/responses/faturamento-conciliado/reenvio-notas.response';
import { RegerarConciliacaoResponse } from '../core/responses/faturamento-conciliado/regerar-conciliacao.response';
import { RemoverItemConciliacaoResponse } from '../core/responses/faturamento-conciliado/remover-item-conciliacao.response';
import { ReprocessarConciliacaoItemResponse } from '../core/responses/faturamento-conciliado/reprocessar-conciliacao-item.response';
import { IFaturamentoConciliadoService } from './interfaces/faturamento-conciliado.service';

@Injectable()
export class FaturamentoConciliadoService
  implements IFaturamentoConciliadoService {
  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApiFaturamento}faturamento-conciliado`;

  private _aplicarDescontoDados: BehaviorSubject<AplicarDescontoDados> =
    new BehaviorSubject(null);
  public aplicarDescontoDados$ = this._aplicarDescontoDados
    .asObservable()
    .pipe(filter((aplicarDescontoDados) => !!aplicarDescontoDados));

  retornoAplicarDescontoDados(
    aplicarDescontoDados: AplicarDescontoDados
  ): void {
    this._aplicarDescontoDados.next(aplicarDescontoDados);
  }

  private _dadosPendencia: BehaviorSubject<any> = new BehaviorSubject(null);
  public dadosPendencia$ = this._dadosPendencia
    .asObservable()
    .pipe(filter((dadosPendencia) => !!dadosPendencia));

  mandarDadosPendencia(dadosPendencia: any): void {
    this._dadosPendencia.next(dadosPendencia);
  }

  obterTableConciliacao(
    pageIndex: number = 0,
    pageSize: number = 25,
    sort: string = null,
    listaStatus: number[] = null,
    filtro: FiltroConciliacao = null
  ): Observable<ObterConciliacaoResponse> {
    let url = `${this.api}/conciliacao`;

    let params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize);

    if (sort) {
      params = params.append('sort', sort);
    }
    if (listaStatus) {
      listaStatus.forEach((s) => {
        params = params.append('listaStatus', s);
      });
    }

    if (filtro) {
      Object.keys(filtro).forEach((key) => {
        if (filtro[key]) {
          if (key === 'EmpresaId' || key === 'Uf' || key === 'ListaStatus' || key === 'StatusRegistro') {
            filtro[key].forEach((value) => {
              params = params.append(key, value);
            });
          } else {
            params = params.append(key, filtro[key]);
          }
        }
      });
    }

    return this.http
      .get(url, { params: params })
      .pipe(map((data) => this.transformToObterTableConciliacao(data)));
  }

  baixarConciliacao(id: number): Observable<BaixarArquivoResponse> {
    const url = `${this.api}/gerar-arquivo/${id}`;

    return this.http
      .post(url, null)
      .pipe(map((data) => this.transformToBaixarArquivo(data)));
  }

  aprovarConciliacao(
    request: AprovarConciliacaoRequest
  ): Observable<AprovarConciliacaoResponse> {
    let url = `${this.api}/conciliacao/aprovar`;

    return this.http
      .post(url, request)
      .pipe(map((data) => this.transformToAprovarConciliacaoResponse(data)));
  }

  aplicarDesconto(
    request: AplicarDescontoRequest
  ): Observable<AplicarDescontoResponse> {
    let url = `${this.api}/faturar/desconto`;

    return this.http
      .post(url, request)
      .pipe(map((data) => this.transformToAplicarDescontoResponse(data)));
  }

  editarDesconto(
    request: EditarDescontoRequest
  ): Observable<EditarDescontoResponse> {
    let url = `${this.api}/faturar/desconto/`;

    return this.http
      .put(url, request)
      .pipe(map((data) => this.transformToEditarDescontoResponse(data)));
  }

  cancelarDesconto(id: number): Observable<CancelarDescontoResponse> {
    let url = `${this.api}/faturar/desconto/${id}`;

    return this.http
      .delete(url, {})
      .pipe(map((data) => this.transformToCancelarDescontoResponse(data)));
  }

  obterDescontoCadastrado(
    id: number
  ): Observable<ObterDescontoCadastradoResponse> {
    let url = `${this.api}/faturar/desconto/${id}`;

    return this.http
      .get(url, {})
      .pipe(
        map((data) => this.transformToObterDescontoCadastradoResponse(data))
      );
  }

  obterTableDetalhamentoPendencias(
    id: number,
    pageIndex: number = 0,
    pageSize: number = 25,
    sort: string = null,
    listaStatus: number[] = null
  ): Observable<ObterFaturamentoConciliadoItensResponse> {
    let url = `${this.api}/conciliacao/${id}/item`;

    let params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize);

    if (listaStatus) {
      listaStatus.forEach((s) => {
        params = params.append('listaStatus', s);
      });
    }

    return this.http
      .get(url, { params: params })
      .pipe(
        map((data) => this.transformToObterFaturamentoConciliadoItens(data))
      );
  }

  obterTableFaturar(pageIndex: number = 0, pageSize: number = 25, sort: string = null, filtro: FiltroConciliacao): Observable<ObterConciliacaoResponse> {
    let url = `${this.api}/faturar`;

    let params = new HttpParams().set('pageIndex', pageIndex).set('pageSize', pageSize);

    if (sort) {
      params = params.append('sort', sort);
    }

    if (filtro) {
      Object.keys(filtro).forEach((key) => {
        if (filtro[key]) {
          if (key === 'EmpresaId' || key === 'Uf' || key === 'ListaStatus') {
            filtro[key].forEach((value) => {
              params = params.append(key, value);
            });
          } else {
            params = params.append(key, filtro[key]);
          }
        }
      });
    }

    return this.http
      .get(url, { params: params })
      .pipe(map((data) => this.transformToObterTableConciliacao(data)));
  }

  aprovarEnviarFaturamento(
    request: AprovarFaturamentoRequest
  ): Observable<AprovarFaturamentoResponse> {
    let url = `${this.api}/faturar/aprovar`;

    return this.http
      .post(url, request)
      .pipe(map((data) => this.transformToAprovarFaturamentoResponse(data)));
  }

  aprovarFaturamento(
    request: AprovarFaturamentoRequest
  ): Observable<AprovarFaturamentoResponse> {
    let url = `${this.api}/faturar/aprovar/async`;

    return this.http
      .post(url, request)
      .pipe(map((data) => this.transformToAprovarFaturamentoResponse(data)));
  }

  removerItemConciliacao(request: RemoverItemConciliacaoRequest) {
    let url = `${this.api}/conciliacao/item`;

    return this.http
      .delete(url, { body: request })
      .pipe(
        map((data) => this.transformToRemoverItemConciliacaoResponse(data))
      );
  }

  excluirDuplicidade(request: ExcluirDuplicidadeRequest) {
    let url = `${this.api}/conciliacao/duplicidade`;

    return this.http
      .post(url, request)
      .pipe(map((data) => this.transformToExcluirDuplicidadeResponse(data)));
  }

  reprocessarConciliacaoItem(
    id: number
  ): Observable<ReprocessarConciliacaoItemResponse> {
    let url = `${this.api}/conciliacao/reprocessar/${id}`;

    return this.http
      .post(url, null)
      .pipe(
        map((data) => this.transformToReprocessarConciliacaoItemResponse(data))
      );
  }

  pesquisarItemConciliacao(
    id: number,
    chassi: string = null,
    numeroContrato: string = null
  ): Observable<PesquisarItemConciliacaoResponse> {
    let url = `${this.api}/conciliacao/item/${id}`;

    let params = new HttpParams();

    if (chassi) {
      params = params.append('chassi', chassi);
    }
    if (numeroContrato) {
      params = params.append('numeroContrato', numeroContrato);
    }

    return this.http
      .get(url, { params: params })
      .pipe(
        map((data) => this.transformToPesquisarItemConciliacaoResponse(data))
      );
  }

  excluirCobrancaConciliacao(
    id: number,
    request: ExcluirCobrancaRequest
  ): Observable<ExcluirCobrancaConciliacaoResponse> {
    let url = `${this.api}/conciliacao/item/deletar/${id}`;

    return this.http
      .patch(url, request)
      .pipe(
        map((data) => this.transformToExcluirCobrancaConciliacaoResponse(data))
      );
  }

  obterTableFaturado(
    pageIndex: number = 0,
    pageSize: number = 25,
    sort: string = null,
    filtro: FiltroFaturado
  ): Observable<ObterConciliacaoResponse> {
    let url = `${this.api}/faturado`;

    let params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize);

    if (sort) {
      params = params.append('sort', sort);
    }

    if (filtro) {
      Object.keys(filtro).forEach((key) => {
        if (filtro[key]) {
          if (
            key === 'EmpresaId' ||
            key === 'Uf' ||
            key === 'ListaStatus' ||
            key === 'ListaNotaFiscal' ||
            key === 'ListaNotaDebito'
          ) {
            filtro[key].forEach((value) => {
              params = params.append(key, value);
            });
          } else {
            params = params.append(key, filtro[key]);
          }
        }
      });
    }

    return this.http
      .get(url, { params: params })
      .pipe(map((data) => this.transformToObterTableConciliacao(data)));
  }

  baixarTodosArquivos(id: number): Observable<BaixarArquivoResponse> {
    const url = `${this.api}/arquivo/todos/${id}`;

    return this.http
      .get(url)
      .pipe(map((data) => this.transformToBaixarArquivo(data)));
  }

  baixarNotaFiscal(id: number): Observable<BaixarArquivoResponse> {
    const url = `${this.api}/arquivo/nota-fiscal/${id}`;

    return this.http
      .get(url)
      .pipe(map((data) => this.transformToBaixarArquivo(data)));
  }

  baixarNotaDebito(id: number): Observable<BaixarArquivoResponse> {
    const url = `${this.api}/arquivo/nota-debito/${id}`;

    return this.http
      .get(url)
      .pipe(map((data) => this.transformToBaixarArquivo(data)));
  }

  emitirEmail(request): Observable<EmitirEmailResponse> {
    let url = `${this.api}/arquivo/enviar-email-notas`;

    return this.http.post<any>(url, request)
      .pipe(map(data => this.transformToEmitirEmailResponse(data)));
  }

  emitirEmailArquivoConciliacao(request): Observable<any> {
    let url = `${this.api}/arquivo/enviar-email-conciliacoes`;

    return this.http.post<any>(url, request)
      .pipe(map(data => this.transformToEmitirEmailResponse(data)));
  }

  obterStatusMotivo() {
    let url = `${this.api}/conciliacao/status-motivo`;

    return this.http.get<ObterStatusMotivoResponse>(url)
      .pipe(map(data => this.transformToObterStatusMotivoResponse(data)));
  }

  oberMotivosExclusaoCobranca(): Observable<ObterMotivosExclusaoCobrancaResponse> {
    let url = `${this.api}/conciliacao/exclusao-motivos`;

    return this.http.get<ObterMotivosExclusaoCobrancaResponse>(url)
      .pipe(map(data => this.transformToObterMotivosExclusaoCobrancaResponse(data)));
  }

  reconciliarArquivo(idConciliacao: number) {
    let url = `${this.api}/reconciliar-arquivo`;

    return this.http.post(url, { idConciliacao: idConciliacao })
      .pipe(map(data => this.transformToReconciliarArquivoResponse(data)));
  }

  retornarConciliacaoAbaAnterior(idsConciliacao: number[]) {
    let url = `${this.api}/reconciliar-arquivo-todos`;

    return this.http.post(url, { idsConciliacao: idsConciliacao })
      .pipe(map(data => this.transformToReconciliarArquivoResponse(data)));
  }

  baixarTodosArquivosGrid(
    ids: number[] = null
  ): Observable<ExportarTodosArquivosResponse> {
    let url = `${this.api}/gerar-arquivo`;

    let params = new HttpParams();

    if (ids) {
      ids.forEach((id) => {
        params = params.append('ids', id);
      });
    }

    return this.http
      .get(url, { params: params })
      .pipe(map((data) => this.transformToExportarTodosArquivosResponse(data)));
  }

  baixarRelatorioFechamento(
    ids: number[] = null
  ): Observable<ExportarTodosArquivosResponse> {
    let url = `${this.api}/relatorio-fechamento`;

    let params = new HttpParams();

    if (ids) {
      ids.forEach((id) => {
        params = params.append('ids', id);
      });
    }

    return this.http
      .get(url, { params: params })
      .pipe(map((data) => this.transformToExportarTodosArquivosResponse(data)));
  }

  baixarArquivoUnicoGrid(
    ids: number[] = null
  ): Observable<ExportarTodosArquivosResponse> {
    let url = `${this.api}/gerar-arquivo-unico`;

    let params = new HttpParams()

    if (ids) {
      ids.forEach((id) => {
        params = params.append('Ids', id);
      });
    }

    return this.http
      .get(url, { params: params })
      .pipe(map((data) => this.transformToExportarTodosArquivosResponse(data)));
  }

  baixarRelatorioFechamentoUnico(
    ids: number[] = null
  ): Observable<ExportarTodosArquivosResponse> {
    let url = `${this.api}/relatorio-fechamento-unico`;

    let params = new HttpParams()

    if (ids) {
      ids.forEach((id) => {
        params = params.append('ids', id);
      });
    }

    return this.http
      .get(url, { params: params })
      .pipe(map((data) => this.transformToExportarTodosArquivosResponse(data)));
  }

  obterObservacoesNotas(idConciliacao: number): Observable<ObterObservacoesNotasResponse> {
    let url = `${this.api}/obter-observacoes-notas/${idConciliacao}`;

    return this.http.get<ObterObservacoesNotasResponse>(url)
      .pipe(map(data => this.transformToObterObservacoesNotasResponse(data)));
  }

  atualizarObservacaoNotas(request: AtualizarObservacaoNotasRequest): Observable<AtualizarObservacaoNotasResponse> {
    let url = `${this.api}/atualizar-observacoes-notas`;

    return this.http.patch<AtualizarObservacaoNotasResponse>(url, request)
      .pipe(map(data => this.transformToAtualizarObservacaoNotasResponse(data)));
  }

  excluirObservacaoNotas(idConciliacao: number) {
    let url = `${this.api}/excluir-observacoes-notas/${idConciliacao}`;

    return this.http.patch(url, null)
      .pipe(map(data => this.transformToExcluirObservacaoNotasResponse(data)));
  }

  baixarKitCliente(id: number) {
    let url = `${this.api}/faturado/kit-cliente/${id}`;

    return this.http.get(url)
      .pipe(map(data => this.transformToBaixarKitClienteResponse(data)));
  }

  regerarConciliacao(listaConciliacaoId: number[]) {
    let url = `${this.api}/regerar-conciliacoes`;

    return this.http.post(url, listaConciliacaoId)
      .pipe(map(data => this.transformToRegerarConciliacaoResponse(data)));
  }

  reenviarNF(conciliacaoId: number) {
    let url = `${this.api}/reenviar/nf`;

    return this.http.post(url, { faturamentoConciliadoId: conciliacaoId })
      .pipe(map(data => this.transformToReenviarNotaResponse(data)));
  }

  reenviarND(conciliacaoId: number) {
    let url = `${this.api}/reenviar/nd`;

    return this.http.post(url, { faturamentoConciliadoId: conciliacaoId })
      .pipe(map(data => this.transformToReenviarNotaResponse(data)));
  }

  excluirArquivoConciliacao(conciliacaoId: number) {
    let url = `${this.api}/conciliacao/deletar/${conciliacaoId}`;

    return this.http.delete(url)
      .pipe(map(data => this.transformToExcluirArquivoConciliacaoResponse(data)));
  }

  //#region Privates

  private transformToObterTableConciliacao(
    data: any
  ): ObterConciliacaoResponse {
    let response: ObterConciliacaoResponse = new ObterConciliacaoResponse();

    if (data.isSuccessful) {
      response.faturamentoConciliados = data.result.faturamentoConciliados;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToAprovarFaturamentoResponse(
    data: any
  ): AprovarFaturamentoResponse {
    let response: AprovarFaturamentoResponse = new AprovarFaturamentoResponse();

    if (data.isSuccessful) {
      response.aprovado = data.result.aprovado;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToBaixarArquivo(data: any): BaixarArquivoResponse {
    let response: BaixarArquivoResponse = new BaixarArquivoResponse();
    if (data.isSuccessful) {
      response.base64 = data.result.base64;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToAprovarConciliacaoResponse(
    data: any
  ): AprovarConciliacaoResponse {
    let response: AprovarConciliacaoResponse = new AprovarConciliacaoResponse();

    if (data.isSuccessful) {
      response.aprovado = data.result.aprovado;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToAplicarDescontoResponse(
    data: any
  ): AplicarDescontoResponse {
    let response: AplicarDescontoResponse = new AplicarDescontoResponse();

    if (data.isSuccessful) {
      response.descontoId = data.result.descontoId;
      response.success = data.result.success;
      response.message = data.result.message;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToEditarDescontoResponse(data: any): EditarDescontoResponse {
    let response: EditarDescontoResponse = new EditarDescontoResponse();

    if (data.isSuccessful) {
      response.descontoId = data.result.descontoId;
      response.success = data.result.success;
      response.message = data.result.message;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToObterDescontoCadastradoResponse(
    data: any
  ): ObterDescontoCadastradoResponse {
    let response: ObterDescontoCadastradoResponse =
      new ObterDescontoCadastradoResponse();

    if (data.isSuccessful) {
      response.desconto = data.result.desconto;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToCancelarDescontoResponse(
    data: any
  ): CancelarDescontoResponse {
    let response: CancelarDescontoResponse = new CancelarDescontoResponse();

    if (data.isSuccessful) {
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToObterFaturamentoConciliadoItens(
    data: any
  ): ObterFaturamentoConciliadoItensResponse {
    let response: ObterFaturamentoConciliadoItensResponse =
      new ObterFaturamentoConciliadoItensResponse();

    if (data.isSuccessful) {
      response.faturamentoConciliadoItens =
        data.result.faturamentoConciliadoItens;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToRemoverItemConciliacaoResponse(
    data: any
  ): RemoverItemConciliacaoResponse {
    let response: RemoverItemConciliacaoResponse =
      new RemoverItemConciliacaoResponse();

    if (data.isSuccessful) {
      response = data.result;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToExcluirDuplicidadeResponse(
    data: any
  ): ExcluirDuplicidadeResponse {
    let response: ExcluirDuplicidadeResponse = new ExcluirDuplicidadeResponse();

    if (data.isSuccessful) {
      response.opcaoDuplicidade = data.result.opcaoDuplicidade;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToReprocessarConciliacaoItemResponse(
    data: any
  ): ReprocessarConciliacaoItemResponse {
    let response: ReprocessarConciliacaoItemResponse =
      new ReprocessarConciliacaoItemResponse();

    if (data.isSuccessful) {
      response.reprocessado = data.result.reprocessado;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToPesquisarItemConciliacaoResponse(
    data: any
  ): PesquisarItemConciliacaoResponse {
    let response: PesquisarItemConciliacaoResponse =
      new PesquisarItemConciliacaoResponse();

    if (data.isSuccessful) {
      response.faturamentoConciliadoItens =
        data.result.faturamentoConciliadoItens;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToExcluirCobrancaConciliacaoResponse(
    data: any
  ): ExcluirCobrancaConciliacaoResponse {
    let response: ExcluirCobrancaConciliacaoResponse =
      new ExcluirCobrancaConciliacaoResponse();

    if (data.isSuccessful) {
      response.deletado = data.result.deletado;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToEmitirEmailResponse(data: any): EmitirEmailResponse {
    let response: EmitirEmailResponse = new EmitirEmailResponse();
    if (data.success) {
      response.msg = data.msg;
      response.success = data.success;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToObterStatusMotivoResponse(data: any): ObterStatusMotivoResponse {
    let response: ObterStatusMotivoResponse = new ObterStatusMotivoResponse();

    if (data.isSuccessful) {
      response.statusMotivo = data.result.statusMotivo;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToObterMotivosExclusaoCobrancaResponse(data: any): ObterMotivosExclusaoCobrancaResponse {
    let response: ObterMotivosExclusaoCobrancaResponse = new ObterMotivosExclusaoCobrancaResponse();
    if (data.isSuccessful) {
      response.motivoExclusao = data.result.motivoExclusao;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }


  private transformToReconciliarArquivoResponse(data: any) {
    let response: ReconciliarArquivoResponse = new ReconciliarArquivoResponse();

    if (data.isSuccessful) {
      response.flag = data.result.flag;
      response.msg = data.result.msg;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return data;
  }

  private transformToExportarTodosArquivosResponse(data) {
    let response: ExportarTodosArquivosResponse = new ExportarTodosArquivosResponse();

    if (data.isSuccessful) {
      response.base64 = data.result.base64;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToObterObservacoesNotasResponse(data: any): ObterObservacoesNotasResponse {
    let response: ObterObservacoesNotasResponse = new ObterObservacoesNotasResponse();

    if (data.isSuccessful) {
      response.observacaoNF = data.result.observacaoNF;
      response.observacaoND = data.result.observacaoND;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName); });
    return response;
  }

  private transformToAtualizarObservacaoNotasResponse(data: any): AtualizarObservacaoNotasResponse {
    let response: AtualizarObservacaoNotasResponse = new AtualizarObservacaoNotasResponse();

    if (data.isSuccessful) {
      response.flag = data.result.flag;
      response.mensagem = data.result.mensagem;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => response.addError(error.code, error.message, error.propertyName));
    return response;
  }

  private transformToExcluirObservacaoNotasResponse(data: any) {
    let response: AtualizarObservacaoNotasResponse = new AtualizarObservacaoNotasResponse();

    if (data.isSuccessful) {
      response.flag = data.result.flag;
      response.mensagem = data.result.mensagem;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => response.addError(error.code, error.message, error.propertyName));
    return response;
  }

  private transformToBaixarKitClienteResponse(data: any) {
    let response: BaixarKitClienteResponse = new BaixarKitClienteResponse();

    if (data.isSuccessful) {
      response.base64 = data.result.base64;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => response.addError(error.code, error.message, error.propertyName));
    return response;
  }

  private transformToRegerarConciliacaoResponse(data: any) {
    let response: RegerarConciliacaoResponse = new RegerarConciliacaoResponse();

    if (data.isSuccessful) {
      response.msg = data.result.msg;
      response.success = data.result.success;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => response.addError(error.code, error.message, error.propertyName));
    return response;
  }

  private transformToReenviarNotaResponse(data: any) {
    let response: ReenvioNotasResponse = new ReenvioNotasResponse();

    if (data.isSuccessful) {
      response.reenviado = data.result.reenviado;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => response.addError(error.code, error.message, error.propertyName));
    return response;
  }

  private transformToExcluirArquivoConciliacaoResponse(data: any) {
    let response: ExcluirArquivoConciliacaoResponse = new ExcluirArquivoConciliacaoResponse();

    if (data.isSuccessful) {
      response.deletado = data.result.deletado;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => response.addError(error.code, error.message, error.propertyName));
    return response;
  }

  //#endregion
}
