import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { DetalhamentoDudaFiltro } from '../core/models/taxas/detalhamento-duda-filtro.model';
import { ParametrizaDudasFiltro } from '../core/models/taxas/parametriza-dudas-filtro.model';
import { CompraManualRequest } from '../core/requests/taxas/compra-manual.request';
import { ParametrizacaoDudaRequest } from '../core/requests/taxas/parametrizacao-duda.request';
import { CompraManualResponse } from '../core/responses/taxas/compra-manual.response';
import { ObterDetalhamentoDudaResponse } from '../core/responses/taxas/obter-detalhes-compras.response';
import { ObterDudaPorIdResponse } from '../core/responses/taxas/obter-duda-por-id.response';
import { ObterDudasPaginationResponse } from '../core/responses/taxas/obter-dudas-pagination.response';
import { ObterDetalhesDudaResponse } from '../core/responses/taxas/obter-resumo-compras.response';
import { ParametrizacaoDudaResponse } from '../core/responses/taxas/parametrizacao-duda.response';
import { ITaxasService } from './interfaces/taxas.interface.service';

@Injectable({
  providedIn: 'root',
})
export class TaxasService implements ITaxasService {
  api: string = `${this.appSettings.baseUrlApiCRM}taxas`;
  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  obterDetalhesDudas(
    empresaId: number,
    numeroSolicitacao: number
  ): Observable<ObterDetalhesDudaResponse> {
    let url = `${this.api}/duda/resumo-compra-empresa/${empresaId}/numero-solicitacao/${numeroSolicitacao}`;

    let params = new HttpParams()
      .set('empresaId', empresaId)
      .set('numeroSolicitacao', numeroSolicitacao);

    return this.http
      .get<ObterDetalhesDudaResponse>(url, { params: params })
      .pipe(map((data) => this.transformToObterDetalhesDudasResponse(data)));
  }

  obterDetalhamentoDudas(
    pageIndex: number = 0,
    pageSize: number = 5,
    parametrizaDudaId: number,
    filtro: DetalhamentoDudaFiltro = null
  ): Observable<ObterDetalhamentoDudaResponse> {
    let url = `${this.api}/duda/resumo-compra-empresa/${parametrizaDudaId}`;

    let params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize);

    if (filtro) {
      Object.keys(filtro).forEach((key) => {
        if (filtro[key] !== '' || filtro[key].length !== 0) {
          params = params.append(key, filtro[key]);
        }
      });
    }

    return this.http
      .get<ObterDetalhamentoDudaResponse>(url, { params: params })
      .pipe(map((data) => this.transformToObterDetalhamentoDudasResponse(data)));
  }

  obterDudas(
    pageIndex: number = 0,
    pageSize: number = 5,
    filtro: ParametrizaDudasFiltro
  ): Observable<ObterDudasPaginationResponse> {
    let url = `${this.api}/duda`;

    let params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize);

    if (filtro) {
      Object.keys(filtro).forEach((key) => {
        if (filtro[key] !== '' || filtro[key].length !== 0) {
          if (key == 'empresaId') {
            filtro[key].forEach((value) => {
              params = params.append(key, value);
            });
          } else params = params.append(key, filtro[key]);
        }
      });
    }
    return this.http
      .get<ObterDudasPaginationResponse>(url, { params: params })
      .pipe(map((data) => this.transformToObterDudasResponse(data)));
  }

  parametrizarDuda(
    parametrizaDudaId: number,
    parametrizacaoDudaRequest: ParametrizacaoDudaRequest
  ): Observable<ParametrizacaoDudaResponse> {
    let url = `${this.api}/duda/${parametrizaDudaId}/empresa`;

    return this.http
      .put<ParametrizacaoDudaResponse>(url, parametrizacaoDudaRequest)
      .pipe(map((data) => this.transformToParametrizacaoDudaResponse(data)));
  }

  obterDudaPorId(id: number) {
    let url = `${this.api}/duda/${id}/empresa`;

    return this.http
      .get<ObterDudaPorIdResponse>(url)
      .pipe(map((data) => this.transformToObterDudaPorIdResponse(data)));
  }

  compraManual(
    compraManualRequest: CompraManualRequest
  ): Observable<CompraManualResponse> {
    let url = `${this.api}/duda/compra-manual`;

    return this.http
      .post<CompraManualResponse>(url, compraManualRequest)
      .pipe(map((data) => this.transformToCompraManualResponse(data)));
  }

  private transformToObterDetalhesDudasResponse(
    data: any
  ): ObterDetalhesDudaResponse {
    let response: ObterDetalhesDudaResponse =
      new ObterDetalhesDudaResponse();

    if (data.isSuccessful) {
      response.detalhes = data.result.listaDuda;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });

    return response;
  }

  private transformToObterDetalhamentoDudasResponse(
    data: any
  ): ObterDetalhamentoDudaResponse {
    let response: ObterDetalhamentoDudaResponse =
      new ObterDetalhamentoDudaResponse();

    if (data.isSuccessful) {
      response.totalItems = data.result.totalRows;
      response.nomeEmpresa = data.result.nomeEmpresa;
      response.cnpjEmpresa = data.result.cnpjEmpresa;
      response.detalhamentoDudas = data.result.resumoCompraDuda;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });

    return response;
  }

  private transformToObterDudasResponse(
    data: any
  ): ObterDudasPaginationResponse {
    let response: ObterDudasPaginationResponse =
      new ObterDudasPaginationResponse();

    if (data.isSuccessful) {
      response.totalItems = data.result.totalItems;
      response.parametrizaDudas = data.result.parametrizaDudas;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });

    return response;
  }

  private transformToCompraManualResponse(data: any): CompraManualResponse {
    let response: CompraManualResponse = new CompraManualResponse();

    if (data.isSuccessful) {
      response.compraManualId = data.result.compraManualId;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToParametrizacaoDudaResponse(
    data: any
  ): ParametrizacaoDudaResponse {
    let response: ParametrizacaoDudaResponse = new ParametrizacaoDudaResponse();

    if (data.isSuccessful) {
      response.id = data.result.id;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToObterDudaPorIdResponse(data: any): ObterDudaPorIdResponse {
    let response: ObterDudaPorIdResponse = new ObterDudaPorIdResponse();

    if (data.isSuccessful) {
      response = <ObterDudaPorIdResponse>{
        cnpj: data.result.cnpj,
        estoque: data.result.estoque
        // ativo: data.result.ativo,
        // loteMensal: data.result.loteMensal,
        // compraMinima: data.result.compraMinima,
        // qtdLotePadrao: data.result.qtdLotePadrao,
        // qtdGuiaDisponivel: data.result.qtdGuiaDisponivel,
        // ultimaCompra: data.result.ultimaCompra,
        // qtdComprasAutomatica: data.result.qtdComprasAutomatica,
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }
}
