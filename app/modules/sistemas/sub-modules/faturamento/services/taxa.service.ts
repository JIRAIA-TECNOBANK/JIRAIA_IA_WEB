import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { AppSettings } from "src/app/configs/app-settings.config";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { CriarTaxaDetranRequest } from "../core/requests/taxa/criar-taxa-detran.request";
import { CriarTaxaDetranResponse } from "../core/responses/taxa/criar-taxa-detran.response";
import { EditarTaxaDetranResponse } from "../core/responses/taxa/editar-taxa-detran.response";
import { ObterTaxasDetranResponse } from "../core/responses/taxa/obter-taxas-detran.response";
import { ObterTaxasVigentesResponse } from "../core/responses/taxa/obter-taxas-vigentes.response";
import { ITaxaService } from "./interfaces/taxa.service";

@Injectable()
export class TaxaService implements ITaxaService {
    constructor(private appSettings: AppSettings, private http: HttpClient) { }

    api: string = `${this.appSettings.baseUrlApiFaturamento}taxa`;

    obterTaxasDetranPorUf(uf: string): Observable<ObterTaxasDetranResponse> {
        let url = `${this.api}/taxa-detran`;

        const params = new HttpParams()
            .set('Uf', uf);

        return this.http.get(url, { params: params })
            .pipe(map(data => this.transformToObterTaxasDetran(data)));
    }

    criarTaxaDetran(taxaDetran: CriarTaxaDetranRequest): Observable<CriarTaxaDetranResponse> {
        let url = `${this.api}/taxa-detran`;

        return this.http.post(url, taxaDetran)
            .pipe(map(data => this.transformToCriarTaxaDetran(data)));
    }

    editarTaxaDetran(id: number, taxaDetran: CriarTaxaDetranRequest): Observable<EditarTaxaDetranResponse> {
        let url = `${this.api}/taxa-detran`;

        const params = new HttpParams()
            .set('id', id);

        return this.http.put(url, taxaDetran, { params: params })
            .pipe(map(data => this.transformToEditarTaxaDetran(data)));
    }

    excluirTaxaDetran(id: number): Observable<CriarTaxaDetranResponse> {
        let url = `${this.api}/taxa-detran`;

        const params = new HttpParams()
            .set('id', id);

        return this.http.delete(url, { params: params })
            .pipe(map(data => this.transformToCriarTaxaDetran(data)));
    }

    obterTaxasVigentes(ufs: string[] = null) {
        let url = `${this.api}/taxa-detran/taxa-vigente`;

        let params = new HttpParams();

        if (ufs) {
            ufs.forEach(u => { params = params.append('uf', u); })
        }

        return this.http.get(url, { params: params })
            .pipe(map(data => this.transformToObterTaxasVigentesResponse(data)));
    }

    //#region Privates

    private transformToObterTaxasDetran(data: any): ObterTaxasDetranResponse {
        let response: ObterTaxasDetranResponse = new ObterTaxasDetranResponse()

        if (data.isSuccessful) {
            response = data.result;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToCriarTaxaDetran(data: any): CriarTaxaDetranResponse {
        let response: CriarTaxaDetranResponse = new CriarTaxaDetranResponse()

        if (data.isSuccessful) {
            response.taxaDetranId = data.result.taxaDetranId;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToEditarTaxaDetran(data: any): EditarTaxaDetranResponse {
        let response: EditarTaxaDetranResponse = new EditarTaxaDetranResponse()

        if (data.isSuccessful) {
            response.criadoPor = data.result.criadoPor;
            response.dataInicioVigencia = data.result.dataInicioVigencia;
            response.dataTerminoVigencia = data.result.dataTerminoVigencia;
            response.id = data.result.id;
            response.operacoes = data.result.operacoes;
            response.renovacaoAutomatica = data.result.renovacaoAutomatica;
            response.uf = data.result.uf;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToObterTaxasVigentesResponse(data: any): ObterTaxasVigentesResponse {
        let response: ObterTaxasVigentesResponse = new ObterTaxasVigentesResponse()

        if (data.isSuccessful) {
            response = data.result;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    //#endregion
}