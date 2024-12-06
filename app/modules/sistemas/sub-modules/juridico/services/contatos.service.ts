import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, map } from 'rxjs'
import { AppSettings } from 'src/app/configs/app-settings.config'
import { FiltroContatos } from '../core/model/filtro-contatos.model'
import { ObterListaContatosResponse } from '../core/responses/obter-lista-contatos.response'
import { Contato } from '../core/model/contato.model'

@Injectable({
  providedIn: 'root'
})
export class ContatosService {
  api: string = `${this.appSettings.baseUrlApiRegulatorio}contatos`

  constructor(
    private appSettings: AppSettings, 
    private http: HttpClient
  ) {}

  obterListaContatos(
    pageIndex: number = 0, 
    pageSize: number = 25, 
    filtro?: FiltroContatos
  ): Observable<ObterListaContatosResponse> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize)

    if (filtro != undefined) {
      Object.keys(filtro).forEach((key) => {
        if (filtro[key] !== '' && filtro[key] !== null && filtro[key] !== undefined && filtro[key].length) {
          if (key === 'uf' || key === 'tipo') {
            filtro[key].forEach((value) => {
              params = params.append(key, value);
            });
          } else {
            params = params.append(key, filtro[key]);
          }
        }
      });
    }

    return this.http.get<ObterListaContatosResponse>(this.api, { params: params })
  }

  cadastrarContato(payload: Contato): Observable<any> {
    return this.http.post(this.api, payload, { responseType: 'text'})
  }

  editarContato(payload: Contato, idContato: number): Observable<any> {
    const url = `${this.api}/${idContato}`
    return this.http.put(url, payload, { responseType: 'text'})
  }

  deletarContato(idContato: number) {
    const url = `${this.api}/${idContato}`
    return this.http.delete(url)
  }

  consultarPorId(idContato: number) {
    return this.obterListaContatos().pipe(
      map((response: ObterListaContatosResponse) => {
        return response.result.contatos.find(e => e.id == idContato)
      })
    )
  }
}
