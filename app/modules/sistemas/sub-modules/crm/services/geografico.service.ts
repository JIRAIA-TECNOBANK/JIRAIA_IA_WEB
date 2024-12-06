import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { AppSettings } from "src/app/configs/app-settings.config";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { EnderecoResponse } from "../core/responses/geograficos/endereco.response";
import { IGeograficoService } from "./interfaces/geografico.service";

import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { MunicipioResponse } from "../core/responses/geograficos/municipio.response";
import { Municipio } from "../core/models/geograficos/municipio.model";
import { UfsLicenciamentoResponse } from "../core/responses/geograficos/ufs-licenciamento.response";
import { UfsResponse } from "../core/responses/geograficos/ufs.response";
import { Uf } from "../core/models/geograficos/uf.model";

@Injectable()
export class GeograficoService implements IGeograficoService {

    constructor(private appSettings: AppSettings, private http: HttpClient) { }

    api: string = `${this.appSettings.baseUrlApiCRM}geografico`;

    obterEnderecoPorCep(cep: string): Observable<EnderecoResponse> {
        let url = `${this.api}/${cep}/endereco`;

        return this.http.get<EnderecoResponse>(url)
            .pipe(map(data => this.transformToEnderecoResponse(data)));
    }

    obterUfs(): Observable<UfsResponse> {
        let url = `${this.api}/uf`;

        return this.http.get<UfsResponse>(url)
            .pipe(map(data => this.transformToUfsResponse(data)))
    }

    obterMunicipiosPorUf(uf: string): Observable<MunicipioResponse> {
        let url = `${this.api}/municipio/${uf}`;

        return this.http.get<MunicipioResponse>(url)
            .pipe(map(data => this.transformToMunicipiosResponse(data)))
    }

    obterUfsLicenciamento(): Observable<UfsLicenciamentoResponse> {
        let url = `${this.api}/uf`;

        return this.http.get<UfsLicenciamentoResponse>(url)
            .pipe(map(data => this.transformToUfsLicenciamentoResponse(data)));
    }

    //#region Private

    private transformToEnderecoResponse(data: any): EnderecoResponse {
        let response: EnderecoResponse = new EnderecoResponse();

        if (data.isSuccessful) {

            response.endereco.logradouro = data.result.logradouro;
            response.endereco.bairro = data.result.bairro;
            response.endereco.localidade = data.result.localidade;
            response.endereco.uf = data.result.uf;
            response.endereco.municipioResponse.id = data.result.municipioResponse.id;
            response.endereco.municipioResponse.nome = data.result.municipioResponse.nome;

            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message);
        })

        return response;
    }

    private transformToUfsResponse(data: any): UfsResponse {
        let response: UfsResponse = new UfsResponse();

        if (data.isSuccessful) {
            response.ufs = data.result.ufs;

            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message);
        })

        return response;
    }

    private transformToMunicipiosResponse(data: any): MunicipioResponse {
        let response: MunicipioResponse = new MunicipioResponse();

        if (data.isSuccessful) {

            data.result.municipios.forEach((municipio: Municipio) => {
                response.municipios.push(municipio);
            });

            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message);
        })

        return response;
    }

    private transformToUfsLicenciamentoResponse(data: any): UfsLicenciamentoResponse {
        let response: UfsLicenciamentoResponse = new UfsLicenciamentoResponse();

        if (data.isSuccessful) {
            response = data.result.ufs;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message)
        });

        return response;
    }

    //#endregion
}