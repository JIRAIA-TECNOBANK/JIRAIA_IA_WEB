import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { ChatResponse } from '../core/model/chat-response.model';
import { EncontrarDocumentoResponse } from '../core/model/encontrar-documento-response.model';
import { ArquivoCompilado } from '../core/model/arquivo-compilado.model';
import { ArquivoNormativo, StatusArquivoNormativo } from '../core/model/arquivo-normativo.model';

@Injectable({
  providedIn: 'root'
})
export class HackatonService {
  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  private apiUrl: string = `${this.appSettings.baseUrlApiHackaton}`;

  obterResposta(message: string, idAgrupador: number): Observable<ChatResponse> {
    let url = `${this.apiUrl}ChatGpt/chat/${message}`;
    
    if (idAgrupador !== null && idAgrupador !== undefined) {
      url += `?idAgrupador=${idAgrupador}`;
    }
  
    return this.http.post<ChatResponse>(url, null);
  }  

  obterResumoDeDocumento(document: File): Observable<ChatResponse> {
    const formData = new FormData();
    formData.append('documento', document);

    return this.http.post<ChatResponse>(`${this.apiUrl}ChatGpt/resumirdocumento`, formData);
  }

  encontrarDocumentosPorPalavraChave(palavraChave: string): Observable<EncontrarDocumentoResponse> {
    return this.http.post<EncontrarDocumentoResponse>(`${this.apiUrl}ChatGpt/encontrardocumento/${palavraChave}`, null);
  }

  obterArquivosCompilados(): Observable<ArquivoCompilado[]> {
    return this.http.get<ArquivoCompilado[]>(`${this.apiUrl}monitor-normativo/arquivo-compilado`);
  }

  obterArquivosNormativosAprovacao(): Observable<ArquivoNormativo[]> {
    return this.http.get<ArquivoNormativo[]>(`${this.apiUrl}monitor-normativo/arquivo-normativo/aprovacao`);
  }

  obterArquivosNormativosAprovados(): Observable<ArquivoNormativo[]> {
    return this.http.get<ArquivoNormativo[]>(`${this.apiUrl}monitor-normativo/arquivo-normativo/aprovados`);
  }

  obterArquivosNormativosRejeitados(): Observable<ArquivoNormativo[]> {
    return this.http.get<ArquivoNormativo[]>(`${this.apiUrl}monitor-normativo/arquivo-normativo/rejeitado`);
  }

  enviarArquivoCompilado(document: File): Observable<void> {
    const formData = new FormData();
    formData.append('arquivo', document);

    return this.http.post<void>(`${this.apiUrl}monitor-normativo/arquivo-compilado`, formData);
  }

  aprovarNormativo(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}monitor-normativo/arquivo-normativo/aprovar?id=${id}`, null);
  }
  
  rejeitarNormativo(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}monitor-normativo/arquivo-normativo/rejeitar?id=${id}`, null);
  }

  obterArquivoNormativo(id: number): Observable<EncontrarDocumentoResponse> {
    return this.http.get<EncontrarDocumentoResponse>(`${this.apiUrl}monitor-normativo/arquivo-normativo/arquivo?id=${id}`);
  }
}