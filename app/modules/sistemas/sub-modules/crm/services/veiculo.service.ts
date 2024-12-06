import { Injectable } from '@angular/core';
import { IVeiculoService } from './interfaces/veiculo.interface.service';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { ObterMarcasResponse } from '../core/responses/veiculo/obter-marcas.response';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { ObterEspecieResponse } from '../core/responses/veiculo/obter-especie.response';
import { ObterCoresResponse } from '../core/responses/veiculo/obter-cores.response';
import { MarcasFiltro } from '../core/models/veiculos/marcas-filtro.model';
import { EspeciesFiltro } from '../core/models/veiculos/especies-filtro.model';
import { CoresFiltro } from '../core/models/veiculos/cores-filtro.model';
import { AdicionarCorResponse } from '../core/responses/veiculo/adicionar-cor.response';
import { AdicionarEspecieResponse } from '../core/responses/veiculo/adicionar-especie.response';
import { AdicionarMarcaResponse } from '../core/responses/veiculo/adicionar-marca.response';
import { AlterarStatusCorResponse } from '../core/responses/veiculo/alterar-status-cor.response';
import { Cor } from '../core/models/veiculos/cor.model';
import { Especie } from '../core/models/veiculos/especie.model';
import { AlterarStatusEspecieResponse } from '../core/responses/veiculo/alterar-status-especie.response';
import { AlterarStatusMarcaResponse } from '../core/responses/veiculo/alterar-status.marca.response';
import { Marcas } from '../core/models/veiculos/marcas.model';
import { ModelosFiltro } from '../core/models/veiculos/modelos-filtro.model';
import { ObterModelosResponse } from '../core/responses/veiculo/obter-modelos.response';
import { AdicionarModeloResponse } from '../core/responses/veiculo/adicionar-modelo.response';
import { Modelo } from '../core/models/veiculos/modelo.model';
import { AlterarStatusModeloResponse } from '../core/responses/veiculo/alterar-status-modelo.response';
import { AdicionarModeloRequest } from '../core/requests/veiculos/adicionar-modelo.request';
import { AlterarMarcaResponse } from '../core/responses/veiculo/alterar-marca.response';
import { AlterarEspecieResponse } from '../core/responses/veiculo/alterar-especie.response';
import { AlterarCorResponse } from '../core/responses/veiculo/alterar-cor.response';
import { Mode } from 'src/app/core/enums/mode.enum';
import { AlterarModeloResponse } from '../core/responses/veiculo/alterar-modelo.response';

@Injectable()
export class VeiculoService implements IVeiculoService {
  constructor(private appSettings: AppSettings, private http: HttpClient) {}
  api: string = `${this.appSettings.baseUrlApiCRM}`;

  obterMarcasVeiculos(filtro: MarcasFiltro) {
    let url = `${this.api}veiculo/marcas`;

    let params = new HttpParams();
    Object.keys(filtro).forEach((key) => {
      if (filtro[key] !== '' && filtro[key]?.length !== 0 && filtro[key] !== null)
        params = params.append(key, filtro[key]);
    });

    return this.http
      .get<ObterMarcasResponse>(url, { params: params })
      .pipe(map((data) => this.transformToObterMarcasVeiculoResponse(data)));
  }

  adicionarMarca(marca: Marcas) {
    let url = `${this.api}veiculo/marca`;

    return this.http
      .post<AdicionarMarcaResponse>(url, marca)
      .pipe(map((data) => this.transformToAdicionarMarcaResponse(data)));
  }

  alterarStatusMarca(marca: Marcas) {
    let { id, status } = marca;
    status = status === 0 ? 1 : 0;
    let url = `${this.api}veiculo/marca/${id}/status/${status}`;

    return this.http
      .patch<AlterarStatusMarcaResponse>(url, {})
      .pipe(map((data) => this.transformToalterarStatusMarcaResponse(data)));
  }

  alterarMarca(marca: Marcas) {
    let { id, status } = marca;
    let url = `${this.api}veiculo/marca/${id}`;

    return this.http
      .put<AlterarMarcaResponse>(url, marca)
      .pipe(map((data) => this.transformToAlterarMarcaResponse(data)));
  }

  obterEspecieVeiculos(filtro: EspeciesFiltro) {
    let url = `${this.api}veiculo/especies`;

    let params = new HttpParams();
    Object.keys(filtro).forEach((key) => {
      if (filtro[key] !== '' && filtro[key]?.length !== 0 && filtro[key] !== null)
        params = params.append(key, filtro[key]);
    });

    return this.http
      .get<ObterEspecieResponse>(url, { params: params })
      .pipe(map((data) => this.transformToObterEspeciesVeiculoResponse(data)));
  }

  adicionarEspecie(especie: Especie) {
    let url = `${this.api}veiculo/especie`;

    return this.http
      .post<AdicionarEspecieResponse>(url, especie)
      .pipe(map((data) => this.transformToAdicionarEspecieResponse(data)));
  }

  alterarStatusEspecie(especie: Especie) {
    let { id, status } = especie;
    status = status === 0 ? 1 : 0;
    let url = `${this.api}veiculo/especie/${id}/status/${status}`;

    return this.http
      .patch<AlterarStatusEspecieResponse>(url, {})
      .pipe(map((data) => this.transformToalterarStatusEspecieResponse(data)));
  }

  alterarEspecie(especie: Especie) {
    let { id, status } = especie;
    let url = `${this.api}veiculo/especie/${id}`;

    return this.http
      .put<AlterarEspecieResponse>(url, especie)
      .pipe(map((data) => this.transformToAlterarEspecieResponse(data)));
  }

  obterCoresVeiculos(filtro: CoresFiltro) {
    let url = `${this.api}veiculo/cores`;

    let params = new HttpParams();
    Object.keys(filtro).forEach((key) => {
      if (filtro[key] !== '' && filtro[key]?.length !== 0 && filtro[key] !== null)
        params = params.append(key, filtro[key]);
    });

    return this.http
      .get<ObterCoresResponse>(url, { params: params })
      .pipe(map((data) => this.transformToObterCoresVeiculoResponse(data)));
  }

  adicionarCor(cor: Cor) {
    let url = `${this.api}veiculo/cor`;

    return this.http
      .post<AdicionarCorResponse>(url, cor)
      .pipe(map((data) => this.transformToAdicionarCorResponse(data)));
  }

  alterarStatusCor(cor: Cor) {
    let { id, status } = cor;
    status = status === 0 ? 1 : 0;
    let url = `${this.api}veiculo/cor/${id}/status/${status}`;

    return this.http
      .patch<AlterarStatusCorResponse>(url, {})
      .pipe(map((data) => this.transformToalterarStatusCorResponse(data)));
  }

  alterarCor(cor: Cor) {
    let { id, status } = cor;
    let url = `${this.api}veiculo/cor/${id}`;

    return this.http
      .put<AlterarCorResponse>(url, cor)
      .pipe(map((data) => this.transformToAlterarCorResponse(data)));
  }

  obterModelosVeiculos(filtro: ModelosFiltro, marcaId: number) {
    let url = `${this.api}veiculo/${marcaId}/modelos`;

    let params = new HttpParams();
    Object.keys(filtro).forEach((key) => {
      if (filtro[key] !== '' && filtro[key]?.length !== 0 && filtro[key] !== null)
        params = params.append(key, filtro[key]);
    });

    return this.http
      .get<ObterModelosResponse>(url, { params: params })
      .pipe(map((data) => this.transformToObterModelosVeiculoResponse(data)));
  }

  adicionarModelo(request: AdicionarModeloRequest) {
    let url = `${this.api}veiculo/modelo`;
    return this.http
      .post<AdicionarModeloResponse>(url, request)
      .pipe(map((data) => this.transformToAdicionarModeloResponse(data)));
  }

  alterarStatusModelo(modelo: Modelo) {
    let { id, status } = modelo;
    status = status === 0 ? 1 : 0;
    let url = `${this.api}veiculo/modelo/${id}/status/${status}`;

    return this.http
      .patch<AlterarStatusModeloResponse>(url, {})
      .pipe(map((data) => this.transformToalterarStatusModeloResponse(data)));
  }

  alterarModelo(modelo: Modelo, marcaId: number) {
    let { id, status } = modelo;
    let url = `${this.api}veiculo/modelo/${id}`;
    let body: any = modelo;
    body.marcaId = marcaId;

    return this.http
      .put<AlterarModeloResponse>(url, body)
      .pipe(map((data) => this.transformToAlterarModeloResponse(data)));
  }

  // Começo região private transform

  private transformToObterMarcasVeiculoResponse(
    data: any
  ): ObterMarcasResponse {
    let response: ObterMarcasResponse = new ObterMarcasResponse();

    if (data.isSuccessful) {
      response.pageIndex = data.result.pageIndex;
      response.totalItems = data.result.totalItems;
      response.marcas = data.result.marcas;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    });
    return response;
  }

  private transformToAdicionarMarcaResponse(data: any): AdicionarMarcaResponse {
    let response: AdicionarMarcaResponse = new AdicionarMarcaResponse();

    if (data.isSuccessful) {
      response.criado = data.result.criado;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    });
    return response;
  }

  private transformToalterarStatusMarcaResponse(data: any): AlterarStatusMarcaResponse {
    let response: AlterarStatusMarcaResponse = new AlterarStatusMarcaResponse();

    if (data.isSuccessful) {
      response.ativado = data.result.ativado;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    });
    return response;
  }

  private transformToAlterarMarcaResponse(data: any): AlterarMarcaResponse {
    let response: AlterarMarcaResponse = new AlterarMarcaResponse();

    if (data.isSuccessful) {
      response.atualizado = data.result.atualizado;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    });
    return response;
  }

  private transformToObterEspeciesVeiculoResponse(
    data: any
  ): ObterEspecieResponse {
    let response: ObterEspecieResponse = new ObterEspecieResponse();

    if (data.isSuccessful) {
      response.pageIndex = data.result.pageIndex;
      response.totalItems = data.result.totalItems;
      response.especies = data.result.especies;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    });
    return response;
  }

  private transformToAdicionarEspecieResponse(data: any): AdicionarEspecieResponse {
    let response: AdicionarEspecieResponse = new AdicionarEspecieResponse();

    if (data.isSuccessful) {
      response.criado = data.result.criado;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    });
    return response;
  }

  private transformToalterarStatusEspecieResponse(data: any): AlterarStatusEspecieResponse {
    let response: AlterarStatusEspecieResponse = new AlterarStatusEspecieResponse();

    if (data.isSuccessful) {
      response.ativado = data.result.ativado;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    });
    return response;
  }

  private transformToAlterarEspecieResponse(data: any): AlterarEspecieResponse {
    let response: AlterarEspecieResponse = new AlterarEspecieResponse();

    if (data.isSuccessful) {
      response.atualizado = data.result.atualizado;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    });
    return response;
  }

  private transformToObterCoresVeiculoResponse(data: any): ObterCoresResponse {
    let response: ObterCoresResponse = new ObterCoresResponse();

    if (data.isSuccessful) {
      response.pageIndex = data.result.pageIndex;
      response.totalItems = data.result.totalItems;
      response.cores = data.result.cores;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    });
    return response;
  }

  private transformToAdicionarCorResponse(data: any): AdicionarCorResponse {
    let response: AdicionarCorResponse = new AdicionarCorResponse();

    if (data.isSuccessful) {
      response.criado = data.result.criado;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    });
    return response;
  }

  private transformToalterarStatusCorResponse(data: any): AlterarStatusCorResponse {
    let response: AlterarStatusCorResponse = new AlterarStatusCorResponse();

    if (data.isSuccessful) {
      response.ativado = data.result.ativado;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    });
    return response;
  }

  private transformToAlterarCorResponse(data: any): AlterarCorResponse {
    let response: AlterarCorResponse = new AlterarCorResponse();

    if (data.isSuccessful) {
      response.atualizado = data.result.atualizado;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    });
    return response;
  }

  private transformToObterModelosVeiculoResponse(
    data: any
  ): ObterModelosResponse {
    let response: ObterModelosResponse = new ObterModelosResponse();

    if (data.isSuccessful) {
      response.pageIndex = data.result.pageIndex;
      response.totalItems = data.result.totalItems;
      response.modelos = data.result.modelos;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    });
    return response;
  }

  private transformToAdicionarModeloResponse(data: any): AdicionarModeloResponse {
    let response: AdicionarModeloResponse = new AdicionarModeloResponse();

    if (data.isSuccessful) {
      response.criado = data.result.criado;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    });
    return response;
  }

  private transformToalterarStatusModeloResponse(data: any): AlterarStatusModeloResponse {
    let response: AlterarStatusModeloResponse = new AlterarStatusModeloResponse();

    if (data.isSuccessful) {
      response.ativado = data.result.ativado;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    });
    return response;
  }

  private transformToAlterarModeloResponse(data: any): AlterarModeloResponse {
    let response: AlterarModeloResponse = new AlterarModeloResponse();

    if (data.isSuccessful) {
      response.atualizado = data.result.atualizado;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    });
    return response;
  }
}
