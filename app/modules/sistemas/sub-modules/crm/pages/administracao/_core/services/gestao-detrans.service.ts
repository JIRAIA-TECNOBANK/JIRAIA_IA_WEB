import { Injectable } from "@angular/core";
import { IGestaoDetransService } from "./interfaces/gestao-detrans.service.interface";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AppSettings } from "src/app/configs/app-settings.config";
import { ObterDetransPaginadoResponse } from "../responses/gestao-detran/obter-detrans-paginado.response";
import { Observable } from "rxjs";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { map } from "rxjs/operators";
import { ObterDetranPorIdResponse } from "../responses/gestao-detran/obter-detran-por-id.response";
import { AtivarInativarDetranResponse } from "../responses/gestao-detran/ativar-inativar-detran.response";
import { AtualizarDetranRequest } from "../requests/gestao-detran/atualizar-detran.request";
import { AtualizarDetranResponse } from "../responses/gestao-detran/atualizar-detran.response";

@Injectable({
    providedIn: 'root'
})
export class GestaoDetransService implements IGestaoDetransService {
    constructor(private appSettings: AppSettings, private http: HttpClient) { }

    api: string = `${this.appSettings.baseUrlApiCRM}Parametriza/detrans/tempo-inatividade`;

    obterDetransPaginado(filtro: any = null): Observable<ObterDetransPaginadoResponse> {
        let url = `${this.api}`;

        let params = new HttpParams()

        if (filtro) {
            Object.keys(filtro).forEach((key) => {
                if (filtro[key]) {
                    if (filtro[key]?.length !== 0) {
                        if (key === 'uf') {
                            filtro[key].forEach((value) => {
                                params = params.append(key, value);
                            });
                        }
                        else { params = params.append(key, filtro[key]) }
                    }
                }
            })
        }
        return this.http.get<ObterDetransPaginadoResponse>(url)
            .pipe(map(data => this.transformToObterDetransPaginadoResponse(data)));
    }

    obterDetranPorId(id: number) {
        let url = `${this.api}/${id}`;

        return this.http.get<ObterDetranPorIdResponse>(url)
            .pipe(map(data => this.transformToObterDetranPorIdResponse(data)));
    }

    ativarInativarDetran(id: number) {
        let url = `${this.api}/${id}/ativar-desativar`;

        return this.http.patch<AtivarInativarDetranResponse>(url, null)
            .pipe(map(data => this.transformToAtivarInativarDetranResponse(data)));
    }

    atualizarDetran(detranRequest: AtualizarDetranRequest) {
        let url = `${this.api}`;

        return this.http.put<AtualizarDetranResponse>(url, detranRequest)
        .pipe(map(data => this.transformToAtualizarDetranResponse(data)));
    }

    //#region Privates
    private transformToObterDetransPaginadoResponse(data: any): ObterDetransPaginadoResponse {
        let response: ObterDetransPaginadoResponse = new ObterDetransPaginadoResponse()

        if (data.isSuccessful) {
            response.totalItems = data.result.totalItems;
            response.tempoInatividadeDetran = data.result.tempoInatividadeDetran;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToObterDetranPorIdResponse(data: any): ObterDetranPorIdResponse {
        let response: ObterDetranPorIdResponse = new ObterDetranPorIdResponse();

        if (data.isSuccessful) {
            response.id = data.result.id;
            response.uf = data.result.uf;
            response.ativo = data.result.ativo;
            response.periodoInatividade = data.result.periodoInatividade;
            response.data = data.result.data;
            response.hora = data.result.hora;
            response.conectado = data.result.conectado;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToAtivarInativarDetranResponse(data: any): AtivarInativarDetranResponse {
        let response: AtivarInativarDetranResponse = new AtivarInativarDetranResponse();

        if (data.isSuccessful) {
            response.id = data.result.id;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToAtualizarDetranResponse(data: any): AtualizarDetranResponse {
        let response: AtualizarDetranResponse = new AtualizarDetranResponse();

        if (data.isSuccessful) {
            response.id = data.result.id;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }
    //#endregion
}