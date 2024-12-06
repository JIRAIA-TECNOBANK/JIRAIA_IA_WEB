import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { AppSettings } from "src/app/configs/app-settings.config";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { EmpresaPrecoTbk } from "../core/models/cesta-servico/cesta-empresa.model";
import { FaturamentoNotificacao } from "../core/models/empresa/faturamento-notificacao.model";
import { InformacoesContabeis } from "../core/models/empresa/informacoes-contabeis.model";
import { NotaDebitoEmpresa } from "../core/models/empresa/nota-debito-empresa.model";
import { EditarPrecoEmpresa } from "../core/requests/cesta-servico/editar-preco-empresa.request";
import { AlterarCobrancaUnificadaRequest } from "../core/requests/empresa/alterar-cobranca-unificada.request";
import { AlterarDadosCobrancaPagadorRequest } from "../core/requests/empresa/alterar-dados-cobranca-pagador.response";
import { AlterarDadosCobrancaVencimentoRequest } from "../core/requests/empresa/alterar-dados-cobranca-vencimento.resquest";
import { DadosCobrancaRequest } from "../core/requests/empresa/dados-cobranca.request";
import { AlterarCobrancaUnificadaResponse } from "../core/responses/empresa/alterar-cobranca-unificada.response";
import { AlterarDadosCobrancaPagadorResponse } from "../core/responses/empresa/alterar-dados-cobranca-pagador.response";
import { AlterarDadosCobrancaVencimentoResponse } from "../core/responses/empresa/alterar-dados-cobranca-vencimento.response";
import { AlterarFaturamentoNotificacaoResponse } from "../core/responses/empresa/alterar-faturamento-notificacao.response";
import { AlterarInformacoesContabeisResponse } from "../core/responses/empresa/alterar-informacoes-contabeis.response";
import { CriarEmpresaCobrancaResponse } from "../core/responses/empresa/criar-empresa-cobranca.response";
import { CriarEmpresaPrecoTecnobankResponse } from "../core/responses/empresa/criar-empresa-preco-tbk.response";
import { CriarNotaDebitoResponse } from "../core/responses/empresa/criar-nota-debito.response";
import { EditarDadosCobrancaResponse } from "../core/responses/empresa/editar-dados-cobranca.response";
import { ExcluirCestaEmpresaResponse } from "../core/responses/empresa/excluir-cesta-empresa.response";
import { ExisteDadosCobrancaResponse } from "../core/responses/empresa/existe-dados-cobranca.response";
import { ObterCobrancaPagadorResponse } from "../core/responses/empresa/obter-cobranca-pagador.response";
import { ObterCobrancaUnificadaResponse } from "../core/responses/empresa/obter-cobranca-unificada.response";
import { ObterCobrancaVencimentoResponse } from "../core/responses/empresa/obter-cobranca-vencimento.response";
import { ObterDadosCobrancaResponse } from "../core/responses/empresa/obter-dados-cobranca.response";
import { ObterEmitirNotaDebitoEmpresaResponse } from "../core/responses/empresa/obter-emitir-nota-debito-empresa.response";
import { ObterEmpresaPrecoTecnobankResponse } from "../core/responses/empresa/obter-empresa-preco-tbk.response";
import { ObterEmpresasFaturamentoResponse } from "../core/responses/empresa/obter-empresas-faturamento.response";
import { ObterFaturamentoNotificacaoResponse } from "../core/responses/empresa/obter-faturamento-notificacao.response";
import { ObterInformacoesContabeisResponse } from "../core/responses/empresa/obter-informacoes-contabeis.response";
import { IEmpresaFaturamentoService } from "./interfaces/empresa.service";

@Injectable()
export class EmpresaFaturamentoService implements IEmpresaFaturamentoService {
    constructor(private appSettings: AppSettings, private http: HttpClient) { }

    api: string = `${this.appSettings.baseUrlApiFaturamento}empresa`;

    obterEmitirNotaDebitoPorEmpresa(empresaId: number, uf: string): Observable<ObterEmitirNotaDebitoEmpresaResponse> {
        let url = `${this.api}/${empresaId}/taxa-detran/${uf}/uf`;

        return this.http.get(url)
            .pipe(map(data => this.transformToObterNotaDebitoEmpresa(data)));
    }

    criarNotaDebitoPorEmpresa(notaDebitoEmpresa: NotaDebitoEmpresa) {
        let url = `${this.api}/taxa-detran`;

        return this.http.post(url, notaDebitoEmpresa).pipe(map(data => this.transformToCriarNotaDebitoEmpresa(data)));
    }

    editarNotaDebitoPorEmpresa(empresaTaxaDetranId: number, notaDebitoEmpresa: NotaDebitoEmpresa) {
        let url = `${this.api}/${empresaTaxaDetranId}/taxa-detran`;

        return this.http.put(url, notaDebitoEmpresa)
            .pipe(map(data => this.transformToObterNotaDebitoEmpresa(data)));
    }

    incluirDadosCobranca(request: DadosCobrancaRequest): Observable<CriarEmpresaCobrancaResponse> {
        let url = `${this.api}/cobranca`;

        return this.http.post(url, request)
            .pipe(map(data => this.transformToCriarEmpresaCobrancaResponse(data)));
    }

    obterDadosCobranca(empresaId: number) {
        let url = `${this.api}/cobranca/${empresaId}`;

        return this.http.get(url)
            .pipe(map(data => this.transformToObterDadosCobrancaResponse(data)));
    }

    existeDadosCobranca(cnpj: string, empresaId: number) {
        let url = `${this.api}/cobranca/existe/${cnpj}/${empresaId}`;

        return this.http.get(url)
            .pipe(map(data => this.transformToExisteDadosCobrancaResponse(data)));
    }

    editarDadosCobranca(request: DadosCobrancaRequest): Observable<EditarDadosCobrancaResponse> {
        let url = `${this.api}/cobranca`;

        return this.http.put(url, request)
            .pipe(map(data => this.transformToEditarDadosCobrancaResponse(data)));
    }

    criarEmpresaPrecoTecnobank(request: EmpresaPrecoTbk): Observable<CriarEmpresaPrecoTecnobankResponse> {
        let url = `${this.api}/preco-tecnobank`;

        return this.http.post(url, request)
            .pipe(map(data => this.transformToCriarEmpresaPrecoTecnobankResponse(data)));
    }

    obterEmpresaPrecoTecnobank(empresaId: number, uf: string): Observable<ObterEmpresaPrecoTecnobankResponse> {
        let url = `${this.api}/preco-tecnobank/${empresaId}/${uf}`;

        return this.http.get(url)
            .pipe(map(data => this.transformToObterEmpresaPrecoTecnobankResponse(data)));
    }

    obterEmpresaPrecoTecnobankPorId(id: number): Observable<ObterEmpresaPrecoTecnobankResponse> {
        let url = `${this.api}/preco-tecnobank/${id}`;

        return this.http.get(url)
            .pipe(map(data => this.transformToObterEmpresaPrecoTecnobankResponse(data)));
    }


    obterEmpresasFiltro(pageIndex: number = 0, pageSize: number = 5, filtro: string = ''): Observable<ObterEmpresasFaturamentoResponse> {
        let url = `${this.api}`;

        const params = new HttpParams()
            .set('pageIndex', pageIndex)
            .set('pageSize', pageSize)
            .set('filtro', filtro);

        return this.http
            .get<ObterEmpresasFaturamentoResponse>(url, { params: params })
            .pipe(map((data) => this.transformToObterEmpresasResponse(data)));
    }

    editarPrecoPrivadoEmpresa(request: EditarPrecoEmpresa) {
        let url = `${this.api}/preco-tecnobank`;

        return this.http.put(url, request)
            .pipe(map((data) => this.transformToEditarPrecoPrivadoEmpresa(data)));
    }

    obterFaturamentoNotificacoes(empresaId: number) {
        let url = `${this.api}/cobranca/notificacao/${empresaId}`;

        return this.http.get<ObterFaturamentoNotificacaoResponse>(url)
            .pipe(map((data) => this.transformToObterFaturamentoNotificacoes(data)));
    }

    alterarFaturamentoNotificacoes(faturamentoNotificacao: FaturamentoNotificacao) {
        let url = `${this.api}/cobranca/notificacao`;

        return this.http.put(url, faturamentoNotificacao)
            .pipe(map((data) => this.transformToAlterarFaturamentoNotificacao(data)));
    }

    obterCobrancaUnificada(empresaId: number) {
        let url = `${this.api}/cobranca/unificada/${empresaId}`;

        return this.http.get(url)
            .pipe(map((data) => this.transformToObterCobrancaUnificada(data)));
    }

    alterarCobrancaUnificada(request: AlterarCobrancaUnificadaRequest) {
        let url = `${this.api}/cobranca/unificada`;

        return this.http.put(url, request)
            .pipe(map((data) => this.transformToAlterarCobrancaUnificada(data)));
    }

    obterDadosCobrancaVencimento(empresaId: number) {
        let url = `${this.api}/cobranca/vencimento/${empresaId}`;

        return this.http.get<ObterCobrancaVencimentoResponse>(url)
            .pipe(map((data) => this.transformToObterDadosCobrancaVencimento(data)));
    }

    obterDadosCobrancaPagador(empresaId: number) {
        let url = `${this.api}/cobranca/pagador/${empresaId}`;

        return this.http.get<ObterCobrancaPagadorResponse>(url)
            .pipe(map((data) => this.transformToObterCobrancaPagadorResponse(data)));
    }

    alterarDadosCobrancaVencimento(request: AlterarDadosCobrancaVencimentoRequest) {
        let url = `${this.api}/cobranca/vencimento`;

        return this.http.patch(url, request)
            .pipe(map((data) => this.transformToAlterarDadosCobrancaVencimento(data)));
    }

    alterarDadosCobrancaPagador(request: AlterarDadosCobrancaPagadorRequest) {
        let url = `${this.api}/cobranca/pagador`;

        return this.http.patch(url, request)
            .pipe(map((data) => this.transformToAlterarDadosCobrancaPagador(data)));
    }

    alterarInformacoesContabeis(request: InformacoesContabeis): Observable<AlterarInformacoesContabeisResponse> {
        let url = `${this.api}/informacoes-contabeis`;

        return this.http.put<AlterarInformacoesContabeisResponse>(url, request)
            .pipe(map((data) => this.transformToAlterarInformacoesContabeisResponse(data)));
    }

    obterInformacoesContabeis(empresaId: number) {
        let url = `${this.api}/informacoes-contabeis/${empresaId}`;

        return this.http.get(url)
            .pipe(map((data) => this.transformToObterInformacoesContabeisResponse(data)));
    }

    excluirCestaEmpresa(precoId: number): Observable<ExcluirCestaEmpresaResponse> {
        let url = `${this.api}/preco-tecnobank/${precoId}`;

        return this.http.delete(url)
            .pipe(map(data => this.transformToExcluirCestaEmpresaResponse(data)));
    }

    private transformToObterNotaDebitoEmpresa(data: any): ObterEmitirNotaDebitoEmpresaResponse {
        let response: ObterEmitirNotaDebitoEmpresaResponse = new ObterEmitirNotaDebitoEmpresaResponse()

        if (data.isSuccessful) {
            response.empresaTaxaDetranId = data.result.empresaTaxaDetranId;
            response.empresaId = data.result.empresaId;
            response.notaDebito = data.result.notaDebito;
            response.uf = data.result.uf;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToCriarNotaDebitoEmpresa(data: any): any {
        let response: CriarNotaDebitoResponse = new CriarNotaDebitoResponse()

        if (data.isSuccessful) {
            response.empresaTaxaDetranId = data.result.empresaTaxaDetranId;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToCriarEmpresaCobrancaResponse(data: any): CriarEmpresaCobrancaResponse {
        let response: CriarEmpresaCobrancaResponse = new CriarEmpresaCobrancaResponse()

        if (data.isSuccessful) {
            response.cobrancaId = data.result.cobrancaId;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToObterDadosCobrancaResponse(data: any): ObterDadosCobrancaResponse {
        let response: ObterDadosCobrancaResponse = new ObterDadosCobrancaResponse()

        if (data.isSuccessful) {
            response.cobranca = data.result.cobranca;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToExisteDadosCobrancaResponse(data: any): ExisteDadosCobrancaResponse {
        let response: ExisteDadosCobrancaResponse = new ExisteDadosCobrancaResponse()

        if (data.isSuccessful) {
            response.cobranca = data.result.cobranca;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToEditarDadosCobrancaResponse(data: any): EditarDadosCobrancaResponse {
        let response: EditarDadosCobrancaResponse = new EditarDadosCobrancaResponse()

        if (data.isSuccessful) {
            response.editado = data.result.editado;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToObterEmpresasResponse(data: any): ObterEmpresasFaturamentoResponse {
        let response: ObterEmpresasFaturamentoResponse = new ObterEmpresasFaturamentoResponse();

        if (data.isSuccessful) {
            response.empresas = data.result.empresas;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName);
        });

        return response;
    }

    private transformToCriarEmpresaPrecoTecnobankResponse(data: any): CriarEmpresaPrecoTecnobankResponse {
        let response: CriarEmpresaPrecoTecnobankResponse = new CriarEmpresaPrecoTecnobankResponse()

        if (data.isSuccessful) {
            response.empresaPrecoTecnobankId = data.result.empresaPrecoTecnobankId;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToObterEmpresaPrecoTecnobankResponse(data: any): ObterEmpresaPrecoTecnobankResponse {
        let response: ObterEmpresaPrecoTecnobankResponse = new ObterEmpresaPrecoTecnobankResponse()

        if (data.isSuccessful) {
            response.listaEmpresaPrecoTecnobank = data.result.listaEmpresaPrecoTecnobank;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToEditarPrecoPrivadoEmpresa(data: any): CriarEmpresaPrecoTecnobankResponse {
        let response: CriarEmpresaPrecoTecnobankResponse = new CriarEmpresaPrecoTecnobankResponse()

        if (data.isSuccessful) {
            response.empresaPrecoTecnobankId = data.result.empresaPrecoTecnobankId;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToObterFaturamentoNotificacoes(data: any): ObterFaturamentoNotificacaoResponse {
        let response: ObterFaturamentoNotificacaoResponse = new ObterFaturamentoNotificacaoResponse()

        if (data.isSuccessful) {
            response.cobrancaNotificacao = data.result.cobrancaNotificacao;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToAlterarFaturamentoNotificacao(data: any): AlterarFaturamentoNotificacaoResponse {
        let response: AlterarFaturamentoNotificacaoResponse = new AlterarFaturamentoNotificacaoResponse()

        if (data.isSuccessful) {
            response.editado = data.result.editado;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToObterCobrancaUnificada(data: any): ObterCobrancaUnificadaResponse {
        let response: ObterCobrancaUnificadaResponse = new ObterCobrancaUnificadaResponse()

        if (data.isSuccessful) {
            response.cobrancaUnificada = data.result.cobrancaUnificada;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToObterDadosCobrancaVencimento(data: any): ObterCobrancaVencimentoResponse {
        let response: ObterCobrancaVencimentoResponse = new ObterCobrancaVencimentoResponse()

        if (data.isSuccessful) {
            response.cobrancaVencimento = data.result.cobrancaVencimento;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToAlterarCobrancaUnificada(data: any): AlterarCobrancaUnificadaResponse {
        let response: AlterarCobrancaUnificadaResponse = new AlterarCobrancaUnificadaResponse()
        if (data.isSuccessful) {
            response.editado = data.result.editado;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToObterCobrancaPagadorResponse(data: any): ObterCobrancaPagadorResponse {
        let response: ObterCobrancaPagadorResponse = new ObterCobrancaPagadorResponse()

        if (data.isSuccessful) {
            response.cobrancaPagador = data.result.cobrancaPagador;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToAlterarDadosCobrancaVencimento(data: any): AlterarDadosCobrancaVencimentoResponse {
        let response: AlterarDadosCobrancaVencimentoResponse = new AlterarDadosCobrancaVencimentoResponse()

        if (data.isSuccessful) {
            response.editado = data.result.editado;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToAlterarDadosCobrancaPagador(data: any): AlterarDadosCobrancaPagadorResponse {
        let response: AlterarDadosCobrancaPagadorResponse = new AlterarDadosCobrancaPagadorResponse()

        if (data.isSuccessful) {
            response.editado = data.result.editado;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToAlterarInformacoesContabeisResponse(data: any): AlterarInformacoesContabeisResponse {
        let response: AlterarInformacoesContabeisResponse = new AlterarInformacoesContabeisResponse()

        if (data.isSuccessful) {
            response.editado = data.result.editado;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToObterInformacoesContabeisResponse(data: any): ObterInformacoesContabeisResponse {
        let response: ObterInformacoesContabeisResponse = new ObterInformacoesContabeisResponse()

        if (data.isSuccessful) {
            response.informacoesContabeis = data.result.informacoesContabeis;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToExcluirCestaEmpresaResponse(data: any): ExcluirCestaEmpresaResponse {
        let response: ExcluirCestaEmpresaResponse = new ExcluirCestaEmpresaResponse()

        if (data.isSuccessful) {
            response.deletado = data.result.deletado;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    //#endregion
}