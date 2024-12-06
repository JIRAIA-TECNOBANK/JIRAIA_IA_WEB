import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AppSettings } from "src/app/configs/app-settings.config";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { Municipio } from "../../../crm/core/models/geograficos/municipio.model";
import { EnderecoResponse } from "../../../crm/core/responses/geograficos/endereco.response";
import { MunicipioResponse } from "../../../crm/core/responses/geograficos/municipio.response";
import { UfsLicenciamentoResponse } from "../../../crm/core/responses/geograficos/ufs-licenciamento.response";
import { IPortalGeograficoService } from "../interfaces/_portal/portal-geografico.service";

@Injectable()
export class PortalGeograficoService implements IPortalGeograficoService {

  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApiPortal}geografico`;

  obterMunicipiosPorUf(uf: string): Observable<MunicipioResponse> {
    let url = this.api + `/${uf}/municipios`;

    return this.http.get<MunicipioResponse>(url)
      .pipe(map(data => this.transformToMunicipiosResponse(data)))
  }

  obterEnderecoPorCep(cep: string): Observable<EnderecoResponse> {
    let url = this.api + `/${cep}/endereco`;

    return this.http.get<EnderecoResponse>(url)
      .pipe(map(data => this.transformToEnderecoResponse(data)));
  }

  obterUfsLicenciamento(): Observable<UfsLicenciamentoResponse> {
    let url = this.api + `/ufs/licenciamento`;

    return this.http.get<UfsLicenciamentoResponse>(url)
      .pipe(map(data => this.transformToUfsLicenciamentoResponse(data)));
  }

  private transformToMunicipiosResponse(data: any): MunicipioResponse {
    let response: MunicipioResponse = new MunicipioResponse();

    if (data.isSuccessful) {

      data.result.forEach((municipio: Municipio) => {
        response.municipios.push(municipio);
      });

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToEnderecoResponse(data: any): EnderecoResponse {
    let response: EnderecoResponse = new EnderecoResponse();

    if (data.isSuccessful) {

      response.endereco.logradouro = data.result.logradouro;
      response.endereco.bairro = data.result.bairro;
      response.endereco.municipio = data.result.localidade;
      response.endereco.uf = data.result.uf;

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToUfsLicenciamentoResponse(data: any): UfsLicenciamentoResponse {
    let response: UfsLicenciamentoResponse = new UfsLicenciamentoResponse;

    if (data.isSuccessful) {
      response.sigla = data.result.sigla;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message)
    });

    return response;
  }

  //#endregion
}