import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { AppSettings } from "src/app/configs/app-settings.config";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { FiltroAprovacaoCancelamentoNota } from "../core/models/gestao-aprovacoes/filtro-aprovacao-cancelamento-nota.model";
import { AprovarCestaServicoResponse } from "../core/responses/aprovacao/aprovar-cesta-servico.response";
import { CancelarNotaResponse } from "../core/responses/aprovacao/cancelar-nota.response";
import { ObterTableAprovacaoCestaServico } from "../core/responses/aprovacao/obter-table-aprovacao-cesta-servico.response";
import { ObterTableCancelamentoNotasResponse } from "../core/responses/aprovacao/obter-table-cancelamento-notas.response";
import { RecusarCancelamentoResponse } from "../core/responses/aprovacao/recusar-cancelamento.response";
import { RecusarCestaServicoResponse } from "../core/responses/aprovacao/recusar-cesta-servico.response";
import { SolicitarCancelamentoNotaResponse } from "../core/responses/aprovacao/solicitar-cancelamento-nota.response";
import { IFaturamentoAprovacaoService } from "./interfaces/aprovacao.service";

@Injectable()
export class FaturamentoAprovacaoService
    implements IFaturamentoAprovacaoService {
    constructor(private appSettings: AppSettings, private http: HttpClient) { }

    api: string = `${this.appSettings.baseUrlApiFaturamento}aprovacao`;

    solicitarCancelamentoNF(faturamentoConciliadoId: number) {
        let url = `${this.api}/solicitar/nf`;

        return this.http.post(url, { faturamentoConciliadoId: faturamentoConciliadoId })
            .pipe(map(data => this.transformToSolicitarCancelamentoNotaResponse(data)));
    }

    solicitarCancelamentoND(faturamentoConciliadoId: number) {
        let url = `${this.api}/solicitar/nd`;

        return this.http.post(url, { faturamentoConciliadoId: faturamentoConciliadoId })
            .pipe(map(data => this.transformToSolicitarCancelamentoNotaResponse(data)));
    }

    obterTableCancelamentoNotas(pageIndex: number = 0, pageSize: number = 25, sort: string = null, filtro: FiltroAprovacaoCancelamentoNota = null): Observable<ObterTableCancelamentoNotasResponse> {
        let url = `${this.api}/consultar-nota`;

        let params = new HttpParams()
            .set('pageIndex', pageIndex)
            .set('pageSize', pageSize);

        if (sort) {
            params = params.append('sort', sort);
        }

        if (filtro) {
            Object.keys(filtro).forEach((key) => {
                if (filtro[key] != null) {
                    if (key === 'EmpresaId' || key === 'Uf') {
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
            .pipe(map((data) => this.transformToObterTableCancelamentoNotas(data)));
    }

    aprovarCancelamentoNota(ids: number[]) {
        let url = `${this.api}/cancelar/nota`;

        return this.http.post(url, { ids: ids })
            .pipe(map(data => this.transformToCancelamentoNotaResponse(data)));
    }

    recusarCancelamentoNota(id: number) {
        let url = `${this.api}/recusar/nota`;

        return this.http.post(url, { id: id })
            .pipe(map(data => this.transformToRecusarCancelamentoNotaResponse(data)));
    }

    //#region Cesta

    obterTableAprovacaoCesta(pageIndex: number = 0, pageSize: number = 25, sort: string = null, filtro: FiltroAprovacaoCancelamentoNota = null): Observable<ObterTableAprovacaoCestaServico> {
        let url = `${this.api}/consultar-preco`;

        let params = new HttpParams()
            .set('pageIndex', pageIndex)
            .set('pageSize', pageSize);

        if (sort) {
            params = params.append('sort', sort);
        }

        if (filtro) {
            Object.keys(filtro).forEach((key) => {
                if (filtro[key] != null) {
                    if (key === 'EmpresaId' || key === 'Uf') {
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
            .pipe(map((data) => this.transformToObterTableAprovarCestaServico(data)));
    }

    aprovarCestaServico(ids: number[]) {
        let url = `${this.api}/aprovar/preco`;

        return this.http.post(url, { ids: ids })
            .pipe(map(data => this.transformToAprovarCestaServicoResponse(data)));
    }

    recusarCestaServico(id: number) {
        let url = `${this.api}/recusar/preco`;

        return this.http.post(url, { id: id })
            .pipe(map(data => this.transformToRecusarCestaServicoResponse(data)));
    }

    //#endregion

    //#region Privates

    private transformToSolicitarCancelamentoNotaResponse(data) {
        let response: SolicitarCancelamentoNotaResponse = new SolicitarCancelamentoNotaResponse();

        if (data.isSuccessful) {
            response.solicitado = data.result.solicitado;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => response.addError(error.code, error.message, error.propertyName));
        return response;
    }

    private transformToObterTableCancelamentoNotas(data: any): ObterTableCancelamentoNotasResponse {
        let response: ObterTableCancelamentoNotasResponse = new ObterTableCancelamentoNotasResponse();

        if (data.isSuccessful) {
            response.aprovacoes = data.result.aprovacoes;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName);
        });
        return response;
    }

    private transformToCancelamentoNotaResponse(data: any): CancelarNotaResponse {
        let response: CancelarNotaResponse = new CancelarNotaResponse();

        if (data.isSuccessful) {
            response.cancelado = data.result.cancelado;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName);
        });
        return response;
    }

    private transformToRecusarCancelamentoNotaResponse(data: any): RecusarCancelamentoResponse {
        let response: RecusarCancelamentoResponse = new RecusarCancelamentoResponse();

        if (data.isSuccessful) {
            response.recusado = data.result.recusado;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName);
        });
        return response;
    }

    //#region Cesta

    private transformToObterTableAprovarCestaServico(data: any): ObterTableAprovacaoCestaServico {
        let response: ObterTableAprovacaoCestaServico = new ObterTableAprovacaoCestaServico();

        if (data.isSuccessful) {
            response.aprovacoes = data.result.aprovacoes;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName);
        });
        return response;
    }

    private transformToAprovarCestaServicoResponse(data: any): AprovarCestaServicoResponse {
        let response: AprovarCestaServicoResponse = new AprovarCestaServicoResponse();

        if (data.isSuccessful) {
            response.aprovado = data.result.aprovado;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName);
        });
        return response;
    }

    private transformToRecusarCestaServicoResponse(data: any): RecusarCestaServicoResponse {
        let response: RecusarCestaServicoResponse = new RecusarCestaServicoResponse();

        if (data.isSuccessful) {
            response.recusado = data.result.recusado;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName);
        });
        return response;
    }

    //#endregion

    //#endregion
}
