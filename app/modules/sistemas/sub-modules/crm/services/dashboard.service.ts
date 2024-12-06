import { Injectable } from "@angular/core";
import { AppSettings } from "src/app/configs/app-settings.config";
import { IDashboardService } from "./interfaces/dashboard.interface.service";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { OperacoesRegistradasResponse } from "../core/responses/dashboard/operacoes-registradas.response";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { HttpClient, HttpParams } from "@angular/common/http";
import { ObterRegistrosEstadoResponse } from "../core/responses/dashboard/obter-registros-estado.response";
import { ResumoRegistrosResponse } from "../core/responses/dashboard/resumo-registros.response";
import { RegistrosConsolidadosResponse } from "../core/responses/dashboard/registros-consolidados.response";
import { ObterRegistrosOperacaoResponse } from "../core/responses/dashboard/obter-registros-operacao.response";
import { ObterRegistrosSucessoResponse } from "../core/responses/dashboard/obter-registros-sucesso.response";
import { ObterRegistrosInconsistenciaResponse } from "../core/responses/dashboard/obter-registros-inconsistencia.response";
import { ObterTopEmpresasResponse } from "../core/responses/dashboard/obter-top-empresas.response";
import { ObterTopInconsistenciasResponse } from "../core/responses/dashboard/obter-top-inconsistencias.response";

@Injectable({
    providedIn: 'root'
})
export class DashboardService implements IDashboardService {
    constructor(private appSettings: AppSettings, private http: HttpClient) { }

    api: string = `${this.appSettings.baseUrlApiCRM}dashboard`;

    obterOperacoesRegistradas(dataInicial: string, dataFinal: string): Observable<OperacoesRegistradasResponse> {
        let url = `${this.api}/operacoes-registradas`;

        let params = new HttpParams()
            .set('dataInicio', dataInicial)
            .set('dataFim', dataFinal)

        return this.http.get<OperacoesRegistradasResponse>(url, { params: params })
            .pipe(map((data) => this.transformToObterOperacoesRegistradas(data)));
    }

    obterRegistrosPorEstado(dataInicial: string, dataFinal: string): Observable<ObterRegistrosEstadoResponse> {
        let url = `${this.api}/operacoes-estado`;

        let params = new HttpParams()
            .set('dataInicio', dataInicial)
            .set('dataFim', dataFinal)

        return this.http.get<ObterRegistrosEstadoResponse>(url, { params: params })
            .pipe(map((data) => this.transformToObterRegistrosPorEstado(data)));
    }

    obterResumoIntervalo(start: string, end: string, ufs: string[], empresasId: string[]): Observable<string[]> {
        let url = `${this.api}/intervalo`;

        let params = new HttpParams();
        params = params.append('dataInicio', start)
        params = params.append('dataFim', end);

        return this.http.get<string[]>(url, { params: params })
            .pipe(map((data) => this.transformToObterResumoIntervalo(data)));
    }

    obterRegistrosResumo(start: string, end: string, ufs: string[], empresasId: string): Observable<ResumoRegistrosResponse> {
        let url = `${this.api}/resumo-registros`;

        let params = new HttpParams();
        params = params.append('dataInicio', start)
        params = params.append('dataFim', end);

        if (ufs?.length > 0) {
            ufs.forEach(uf => { params = params.append('ufs', uf); });
        }

        if (empresasId) {
            params = params.append('empresasId', empresasId)
        }

        return this.http.get<ResumoRegistrosResponse>(url, { params: params })
            .pipe(map((data) => this.transformToObterResumoRegistros(data)))
    }

    obterRegistrosConsolidados(start: string, end: string, ufs: string[], empresasId: string[]): Observable<RegistrosConsolidadosResponse> {
        let url = `${this.api}/registros-consolidados`;

        let params = new HttpParams();
        params = params.append('dataInicio', start)
        params = params.append('dataFim', end);

        if (ufs?.length > 0) {
            ufs.forEach(uf => { params = params.append('ufs', uf); });
        }

        if (empresasId?.length > 0) {
            empresasId.forEach(empresaId => { params = params.append('empresasId', empresaId); });
        }

        return this.http.get<RegistrosConsolidadosResponse>(url, { params: params })
            .pipe(map((data) => this.transformToObterRegistrosConsolidados(data)));
    }

    obterRegistrosPorOperacao(dataInicial: string, dataFinal: string): Observable<ObterRegistrosOperacaoResponse> {
        let url = `${this.api}/registros-operacao`;

        let params = new HttpParams()
            .set('dataInicio', dataInicial)
            .set('dataFim', dataFinal)

        return this.http.get<ObterRegistrosOperacaoResponse>(url, { params: params })
            .pipe(map((data) => this.transformToObterRegistrosPorOperacao(data)));
    }

    obterRegistrosComSucesso(dataInicial: string, dataFinal: string): Observable<ObterRegistrosSucessoResponse> {
        let url = `${this.api}/registros-sucesso`;

        let params = new HttpParams()
            .set('dataInicio', dataInicial)
            .set('dataFim', dataFinal)

        return this.http.get<ObterRegistrosSucessoResponse>(url, { params: params })
            .pipe(map((data) => this.transformToObterRegistrosSucessoResponse(data)));
    }

    obterRegistrosComInconsistencia(dataInicial: string, dataFinal: string): Observable<ObterRegistrosInconsistenciaResponse> {
        let url = `${this.api}/registros-inconsistencia`;

        let params = new HttpParams()
            .set('dataInicio', dataInicial)
            .set('dataFim', dataFinal)

        return this.http.get<ObterRegistrosInconsistenciaResponse>(url, { params: params })
            .pipe(map((data) => this.transformToObterRegistrosInconsistenciaResponse(data)));
    }

    obterTopEmpresasSucesso(dataInicial: string, dataFinal: string, ufs: string[]): Observable<ObterTopEmpresasResponse> {
        let url = `${this.api}/empresas/top-sucesso`;

        let params = new HttpParams()
            .set('dataInicio', dataInicial)
            .set('dataFim', dataFinal)

        if (ufs?.length > 0) {
            ufs.forEach(u => { params = params.append('ufs', u); });
        }

        return this.http.get<ObterTopEmpresasResponse>(url, { params: params })
            .pipe(map((data) => this.transformToObterTopEmpresasResponses(data)));
    }

    obterTopEmpresasInconsistencia(dataInicial: string, dataFinal: string, ufs: string[]): Observable<ObterTopEmpresasResponse> {
        let url = `${this.api}/empresas/top-inconsistencia`;

        let params = new HttpParams()
            .set('dataInicio', dataInicial)
            .set('dataFim', dataFinal)

        if (ufs?.length > 0) {
            ufs.forEach(u => { params = params.append('ufs', u); });
        }

        return this.http.get<ObterTopEmpresasResponse>(url, { params: params })
            .pipe(map((data) => this.transformToObterTopEmpresasResponses(data)));
    }

    obterTopInconsistencias(dataInicial: string, dataFinal: string, ufs: string[]): Observable<ObterTopInconsistenciasResponse> {
        let url = `${this.api}/top-inconsistencias`;

        let params = new HttpParams()
            .set('dataInicio', dataInicial)
            .set('dataFim', dataFinal)

        if (ufs?.length > 0) {
            ufs.forEach(u => { params = params.append('ufs', u); });
        }

        return this.http.get<ObterTopInconsistenciasResponse>(url, { params: params })
            .pipe(map((data) => this.transformToObterTopInconsistenciasResponse(data)));
    }

    private transformToObterOperacoesRegistradas(data: any): OperacoesRegistradasResponse {
        let response: OperacoesRegistradasResponse = new OperacoesRegistradasResponse();

        if (data.isSuccessful) {
            response.operacoesRegistradas = data.result.operacoesRegistradas;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName);
        });

        return response;
    }

    private transformToObterRegistrosPorEstado(data: any): ObterRegistrosEstadoResponse {
        let response: ObterRegistrosEstadoResponse = new ObterRegistrosEstadoResponse();

        if (data.isSuccessful) {
            response.operacoesPorEstado = data.result.operacoesPorEstado;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName);
        });

        return response;
    }

    private transformToObterResumoIntervalo(data: any) {
        let response: string[] = [];

        if (data.isSuccessful) {
            response = data.result;
            return response;
        }

        return data.errors;
    }

    private transformToObterResumoRegistros(data: any): ResumoRegistrosResponse {
        let response: ResumoRegistrosResponse = new ResumoRegistrosResponse();

        if (data.isSuccessful) {
            response.resumoRegistros = data.result.resumoRegistros;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName);
        });

        return response;
    }

    private transformToObterRegistrosConsolidados(data: any): RegistrosConsolidadosResponse {
        let response: RegistrosConsolidadosResponse = new RegistrosConsolidadosResponse();

        if (data.isSuccessful) {
            response.qtdeContratosComInconsistencia = data.result.qtdeContratosComInconsistencia;
            response.qtdeContratosInconsistenciaEmAnalise = data.result.qtdeContratosInconsistenciaEmAnalise;
            response.qtdeContratosPendenteRevisao = data.result.qtdeContratosPendenteRevisao;
            response.qtdeContratosRegistrados = data.result.qtdeContratosRegistrados;
            response.qtdeContratosSemImagem = data.result.qtdeContratosSemImagem;
            response.qtdeContratosSemImagemExpirado = data.result.qtdeContratosSemImagemExpirado;
            response.qtdeContratosSemImagemPendente = data.result.qtdeContratosSemImagemPendente;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName);
        });

        return response;
    }

    private transformToObterRegistrosPorOperacao(data: any): ObterRegistrosOperacaoResponse {
        let response: ObterRegistrosOperacaoResponse = new ObterRegistrosOperacaoResponse();

        if (data.isSuccessful) {
            response.registrosPorOperacoes = data.result.registrosPorOperacoes;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName);
        });

        return response;
    }

    private transformToObterRegistrosSucessoResponse(data: any): ObterRegistrosSucessoResponse {
        let response: ObterRegistrosSucessoResponse = new ObterRegistrosSucessoResponse();

        if (data.isSuccessful) {
            response.registrosComSucessos = data.result.registrosComSucessos;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName);
        });

        return response;
    }

    private transformToObterRegistrosInconsistenciaResponse(data: any): ObterRegistrosInconsistenciaResponse {
        let response: ObterRegistrosInconsistenciaResponse = new ObterRegistrosInconsistenciaResponse();

        if (data.isSuccessful) {
            response.registrosComInconsistencias = data.result.registrosComInconsistencias;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName);
        });

        return response;
    }

    private transformToObterTopEmpresasResponses(data: any): ObterTopEmpresasResponse {
        let response: ObterTopEmpresasResponse = new ObterTopEmpresasResponse();

        if (data.isSuccessful) {
            response.topEmpresas = data.result.topEmpresas;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName);
        });

        return response;
    }

    private transformToObterTopInconsistenciasResponse(data: any): ObterTopInconsistenciasResponse {
        let response: ObterTopInconsistenciasResponse = new ObterTopInconsistenciasResponse();

        if (data.isSuccessful) {
            response.topInconsistencias = data.result.topInconsistencias;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName);
        });

        return response;
    }
}