import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { AppSettings } from "src/app/configs/app-settings.config";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { FiltroRelatoriosFaturamento } from "../core/models/relatorios/filtro-relatorios.model";
import { SolicitarRelatorioRequest } from "../core/requests/relatorios/solicitar-relatorio.request";
import { ObterRelatorioFinanceiroPaginadoResponse } from "../core/responses/relatorios/obter-relatorio-financeiro-paginado.response";
import { SolicitarRelatorioFaturamentoResponse } from "../core/responses/relatorios/solicitar-relatorio-faturamento.response";
import { IRelatorioFinanceiroService } from "./interfaces/relatorio-financeiro.service";

@Injectable()
export class RelatorioFinanceiroService implements IRelatorioFinanceiroService {
    constructor(private appSettings: AppSettings, private http: HttpClient) { }

    api: string = `${this.appSettings.baseUrlApiFaturamento}relatorios`;

    obterSolicitacoesRelatorio(pageIndex: number = 0, pageSize: number = 25, filtro: FiltroRelatoriosFaturamento = null): Observable<ObterRelatorioFinanceiroPaginadoResponse> {
        let params = new HttpParams()
            .set('pageIndex', pageIndex)
            .set('pageSize', pageSize);

        if (filtro) {
            Object.keys(filtro).forEach(key => {
                if (filtro[key]) {
                    if (key === 'empresasId'
                        || key === 'modelos'
                        || key === 'formatos'
                        || key === 'ufs'
                        || key === 'status') {
                        filtro[key].forEach((value) => {
                            params = params.append(key, value);
                        });
                    }
                    else { params = params.append(key, filtro[key]) }
                }
            });
        }

        return this.http
            .get<ObterRelatorioFinanceiroPaginadoResponse>(this.api, { params: params })
            .pipe(map((data) => this.transformToObterRelatorioFinanceiroPaginadoResponse(data)));
    }

    solicitarRelatorioFaturamento(request: SolicitarRelatorioRequest) {
        return this.http.post(this.api, request)
            .pipe(map((data) => this.transformToSolicitarRelatorioFaturamentoResponse(data)));

    }

    private transformToObterRelatorioFinanceiroPaginadoResponse(data: any): ObterRelatorioFinanceiroPaginadoResponse {
        var response: ObterRelatorioFinanceiroPaginadoResponse = new ObterRelatorioFinanceiroPaginadoResponse();

        if (data.isSuccessful) {
            response.solicitacaoRelatorios = data.result.solicitacaoRelatorios;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName);
        });

        return response;
    }

    private transformToSolicitarRelatorioFaturamentoResponse(data: any): SolicitarRelatorioFaturamentoResponse {
        var response: SolicitarRelatorioFaturamentoResponse = new SolicitarRelatorioFaturamentoResponse();

        if (data.isSuccessful) {
            response = data.result;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName);
        });

        return response;
    }
}
