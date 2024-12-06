import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { Especie } from '../../../crm/core/models/veiculos/especie.model';
import { ObterEspeciesResponse } from '../../core/responses/_portal/veiculos/obter-especies.response';
import { IVeiculoService } from '../interfaces/_portal/veiculo.service';

@Injectable()
export class VeiculoService implements IVeiculoService {

    constructor(private appSettings: AppSettings, private http: HttpClient) { }

    obterEspecies(): Observable<ObterEspeciesResponse> {
        let url = this.appSettings.baseUrlApiPortal + 'veiculos/especie';

        return this.http.get<ObterEspeciesResponse>(url)
            .pipe(map(data => this.transformToObterEspeciesResponse(data)))
    }

    private transformToObterEspeciesResponse(data: any): ObterEspeciesResponse {
        let response: ObterEspeciesResponse = new ObterEspeciesResponse();

        if (data.isSuccessful) {
            data.result.especies.forEach((especie: Especie) => {
                response.especies.push(especie);
            });

            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message);
        })

        return response;
    }

}
