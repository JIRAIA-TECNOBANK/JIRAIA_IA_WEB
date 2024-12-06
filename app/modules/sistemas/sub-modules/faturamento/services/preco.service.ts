import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { AppSettings } from "src/app/configs/app-settings.config";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { CriarPrecoTbkRequest } from "../core/requests/preco/criar-preco-tbk.request";
import { AprovarPrecosResponse } from "../core/responses/preco/aprovar-precos.response";
import { CriarPrecoTbkResponse } from "../core/responses/preco/criar-preco-tbk.response";
import { EditarPrecoTbkResponse } from "../core/responses/preco/editar-preco-tbk.response";
import { ObterPrecosTbkResponse } from "../core/responses/preco/obter-precos-tbk.response";
import { ObterPrecosVigentesResponse } from "../core/responses/preco/obter-precos-vigentes.response";
import { IPrecoService } from "./interfaces/preco.service";

@Injectable()
export class PrecoService implements IPrecoService {
    constructor(private appSettings: AppSettings, private http: HttpClient) { }

    //#region Preco TBK

    api: string = `${this.appSettings.baseUrlApiFaturamento}preco/tecnobank`;

    obterPrecoTbkPorUf(uf: string = null, ativo: boolean = true, tipoPreco: number = null, aprovado: boolean = null): Observable<ObterPrecosTbkResponse> {
        let url = `${this.api}`;

        let params = new HttpParams();
        params = params.append('ativo', ativo);

        if (uf) { params = params.append('uf', uf) }
        if (tipoPreco) { params = params.append('tipoPreco', tipoPreco); }
        if (aprovado !== null) { params = params.append('aprovado', aprovado); }

        return this.http.get(url, { params: params })
            .pipe(map(data => this.transformToObterCestasServicoResponse(data)));
    }

    criarPrecoTbk(precoTbk: CriarPrecoTbkRequest): Observable<CriarPrecoTbkResponse> {
        let url = `${this.api}`;

        return this.http.post(url, precoTbk)
            .pipe(map(data => this.transformToCriarPrecoTbk(data)));
    }

    editarPrecoTbk(id: number, precoTbk: CriarPrecoTbkRequest): Observable<EditarPrecoTbkResponse> {
        let url = `${this.api}`;

        const params = new HttpParams()
            .set('id', id);

        return this.http.put(url, precoTbk, { params: params })
            .pipe(map(data => this.transformToEditarPrecoTbk(data)));
    }

    excluirPrecoTbk(id: number): Observable<CriarPrecoTbkResponse> {
        let url = `${this.api}`;

        const params = new HttpParams()
            .set('id', id);

        return this.http.delete(url, { params: params })
            .pipe(map(data => this.transformToCriarPrecoTbk(data)));
    }

    obterPrecosVigentes(ufs: string[] = null) {
        let url = `${this.api}/preco-vigente`;

        let params = new HttpParams();

        if (ufs) {
            ufs.forEach(u => { params = params.append('uf', u); })
        }

        return this.http.get(url, { params: params })
            .pipe(map(data => this.transformToObterPrecosVigentesResponse(data)));
    }

    aprovarPrecos(uf: string): Observable<AprovarPrecosResponse> {
        let url = `${this.api}/aprovar/${uf}`;

        return this.http.post<AprovarPrecosResponse>(url, null)
            .pipe(map(data => this.transformToAprovarPrecosResponse(data)));
    }

    //#region Privates

    private transformToObterCestasServicoResponse(data: any): ObterPrecosTbkResponse {
        let response: ObterPrecosTbkResponse = new ObterPrecosTbkResponse()

        if (data.isSuccessful) {
            response = data.result;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToCriarPrecoTbk(data: any): CriarPrecoTbkResponse {
        let response: CriarPrecoTbkResponse = new CriarPrecoTbkResponse()

        if (data.isSuccessful) {
            response.precoTecnobankId = data.result.precoTecnobankId;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToEditarPrecoTbk(data: any): EditarPrecoTbkResponse {
        let response: EditarPrecoTbkResponse = new EditarPrecoTbkResponse()

        if (data.isSuccessful) {
            response.criadoPor = data.result.criadoPor;
            response.dataInicioVigencia = data.result.dataInicioVigencia;
            response.dataTerminoVigencia = data.result.dataTerminoVigencia;
            response.id = data.result.id;
            response.operacoes = data.result.operacoes;
            response.renovacaoAutomatica = data.result.renovacaoAutomatica;
            response.uf = data.result.uf;
            response.tipoPreco = data.result.tipoPreco;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToObterPrecosVigentesResponse(data: any): ObterPrecosVigentesResponse {
        let response: ObterPrecosVigentesResponse = new ObterPrecosVigentesResponse()

        if (data.isSuccessful) {
            response.precoTecnobank = data.result.precoTecnobank;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToAprovarPrecosResponse(data: any): AprovarPrecosResponse {
        let response: AprovarPrecosResponse = new AprovarPrecosResponse()

        if (data.isSuccessful) {
            response.sucesso = data.result.sucesso;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    //#endregion

    //#endregion
}