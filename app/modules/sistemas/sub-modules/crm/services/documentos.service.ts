import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { CadastrarDocumentoRequest } from '../core/requests/documentos/cadastrar-documento.request';
import { CadastrarDocumentoResponse } from '../core/responses/documentos/cadastrar-documento.response';
import { ObterDocumentoPorGuidResponse } from '../core/responses/documentos/obter-documento-por-guid.response';
import { ObterDocumentosResponse } from '../core/responses/documentos/obter-documentos.response';
import { IDocumentosService } from './interfaces/documentos.interface.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentosService implements IDocumentosService {

  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApiCRM}documentos`;

  obterDocumentos(empresaId: number, ativo: boolean, pageSize: number): Observable<ObterDocumentosResponse> {

    let params = new HttpParams()
      .set('ativo', ativo)
      .set('empresaId', empresaId)
      .set('PageSize', pageSize)

    return this.http
      .get<ObterDocumentosResponse>(this.api, { params: params })
      .pipe(map((data) => this.transformToObterDocumentosResponse(data)));
  }

  obterDocumentoPorGuid(empresaId: number, documentoGuid: string) {
      let url = `${this.api}/${empresaId}/empresa/${documentoGuid}/documentoBase64`;

      return this.http.get(url)
        .pipe(map(data => this.transformToObterDocumentoPorGuidResponse(data)));
  }

  cadastrarDocumento(empresaId: number, documento: CadastrarDocumentoRequest) {
    let url = `${this.api}/${empresaId}/empresa`

    return this.http
      .post<CadastrarDocumentoResponse>(url, documento)
      .pipe(map((data) => this.transformToCadastrarDocumentoResponse(data)));
  }

  deletarDocumento(empresaId: number, documentoGuid: string) {
    let url = `${this.api}/${empresaId}/empresa/${documentoGuid}/documento`;

    return this.http.delete(url)
      .pipe(map(data => this.transformDeleteDocumentoResponse(data)));
  }

  //#region Privates

  private transformToObterDocumentosResponse(data: any): ObterDocumentosResponse {
    let response: ObterDocumentosResponse = new ObterDocumentosResponse()

    if (data.isSuccessful) {
      response.documentos = data.result.documentos;

      return response
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName)
    })
  }

  private transformToObterDocumentoPorGuidResponse(data: any): ObterDocumentoPorGuidResponse {
    let response: ObterDocumentoPorGuidResponse = new ObterDocumentoPorGuidResponse();

    if (data.isSuccessful) {
      response = <ObterDocumentoPorGuidResponse>{
        nomeArquivo: data.result.nomeArquivo,
        tamanhoByte: data.result.tamanhoByte,
        documentoBase64: data.result.documentoBase64,
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName)
    })
    return response;
  }

  private transformToCadastrarDocumentoResponse(data: any): CadastrarDocumentoResponse {
    let response: CadastrarDocumentoResponse = new CadastrarDocumentoResponse();

    if (data.isSuccessful) {
      response = <CadastrarDocumentoResponse>{
        documentoGuid: data.result.documentoGuid,
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName); });
    return response;
  }

  private transformDeleteDocumentoResponse(data: any): ObterDocumentosResponse {
    let response: ObterDocumentosResponse = new ObterDocumentosResponse()

    if (data.isSuccessful) {
      response.documentos = data.result.documentos;

      return response
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName)
    })
  }
}
