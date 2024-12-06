import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { map } from "rxjs/operators";
import { AppSettings } from "src/app/configs/app-settings.config";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { ObterProdutosResponse } from "../core/responses/produtos/obter-produtos.response";
import { IProdutosService } from "./interfaces/produtos.interface";

@Injectable()
export class ProdutosService implements IProdutosService {
    constructor(private appSettings: AppSettings, private http: HttpClient) { }

    api: string = `${this.appSettings.baseUrlApiCRM}produtos`;

    obterProdutos(pageIndex: number = 0, pageSize: number = 10): Observable<ObterProdutosResponse> {
        const params = new HttpParams()
            .set('pageIndex', pageIndex)
            .set('pageSize', pageSize)

        return this.http.get<ObterProdutosResponse>(this.api, { params: params })
            .pipe(map(data => this.transformToObterProdutosResponse(data)));
    }

    private transformToObterProdutosResponse(data: any): ObterProdutosResponse {
        let response: ObterProdutosResponse = new ObterProdutosResponse()

        if (data.isSuccessful) {
            response.totalItems = data.result.totalItems;
            response.produtos = data.result.produtos;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName)
        })
    }
}