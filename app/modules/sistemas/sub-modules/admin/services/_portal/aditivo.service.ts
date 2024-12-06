import { Injectable } from "@angular/core";
import { IAditivoService } from "../interfaces/_portal/aditivo.service";
import { HttpClient } from "@angular/common/http";
import { AppSettings } from "src/app/configs/app-settings.config";
import { AlterarAditivoRequest } from "../../core/requests/_portal/aditivos/alterar-aditivo.request";
import { AlterarAditivoResponse } from "../../core/responses/_portal/aditivos/alterar-aditivo.response";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ErrorMessage } from "src/app/core/responses/error-message";

@Injectable()
export class AditivoService implements IAditivoService {

    constructor(private appSettings: AppSettings, private http: HttpClient) { }

    alterarAditivo(aditivo: AlterarAditivoRequest): Observable<AlterarAditivoResponse> {
        let url = this.appSettings.baseUrlApiPortal + 'aditivos';

        return this.http.put<AlterarAditivoResponse>(url, aditivo)
            .pipe(map(data => this.transformToAlterarAditivoResponse(data)));
    }

    private transformToAlterarAditivoResponse(data: any): AlterarAditivoResponse {
        let response: AlterarAditivoResponse = new AlterarAditivoResponse;

        if (data.isSuccessful) { return response; }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message); });
        return response;
    }
}