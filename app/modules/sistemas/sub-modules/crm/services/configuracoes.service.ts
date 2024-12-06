import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { CriarConfigImagemRequest } from '../core/requests/configuracoes/criar-config-imagem.request';
import { AtivarInativarConfigImagemResponse } from '../core/responses/configuracoes/ativar-inativar-imagem.response';
import { CriarConfigImagemResponse } from '../core/responses/configuracoes/criar-config-imagem.response';
import { ObterDetransResponse } from '../core/responses/configuracoes/obter-detrans.response';
import { ObterConfigImagensResponse } from '../core/responses/configuracoes/obter-imagens-config.response';
import { ObterImagensPorIdResponse } from '../core/responses/configuracoes/obter-imagens-por-id.response';
import { CriarBannerRequest } from '../core/requests/configuracoes/gestao-banners/criar-banner.request';
import { AtivarInativarBannerResponse } from '../core/responses/configuracoes/gestao-banners/ativar-inativar-banner.response';
import { CriarBannerResponse } from '../core/responses/configuracoes/gestao-banners/criar-banner.response';
import { ObterBannerPorIdResponse } from '../core/responses/configuracoes/gestao-banners/obter-banner-por-id.response';
import { ObterBannersPaginadoResponse } from '../core/responses/configuracoes/gestao-banners/obter-banners-paginado.response';
import { BannerFiltro } from '../core/models/configuracoes/gestao-banners/banner-filtro.model';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracoesService {

  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApiCRM}Parametriza`;

  obterImagens(pageIndex: number = 0, pageSize: number = 25): Observable<ObterConfigImagensResponse> {
    let url = `${this.api}/imagem`;

    let params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize)

    return this.http.get<ObterConfigImagensResponse>(url, { params: params })
      .pipe(map(data => this.transformToObterImagensResponse(data)));
  }

  obterDetrans(): Observable<ObterDetransResponse> {
    let url = `${this.api}/detrans`;
    return this.http.get<ObterDetransResponse>(url)
      .pipe(map(data => this.transformToObterDetransResponse(data)));
  }

  ativarInativarImagem(imagemId: number, status: boolean) {
    let url = `${this.api}/imagem/${imagemId}/${status}`;

    return this.http.patch(url, null)
      .pipe(map(data => this.transformToAtivarInativarImagem(data)));
  }

  criarConfigImagem(imagem: CriarConfigImagemRequest) {
    let url = `${this.api}/imagem`;
    return this.http
      .post<CriarConfigImagemResponse>(url, imagem)
      .pipe(map((data) => this.transformToCriarConfigImagemResponse(data)));
  }


  atualizarImagem(imagemId: number, imagem: CriarConfigImagemRequest) {
    let url = `${this.api}/imagem/${imagemId}`;

    return this.http
      .put<CriarConfigImagemResponse>(url, imagem)
      .pipe(
        map((data) => this.transformToAtualizarImagemResponse(data))
      );
  }

  obterImagemPorId(imagemId: number) {
    let url = `${this.api}/imagem/${imagemId}`;

    return this.http.get<ObterImagensPorIdResponse>(url)
      .pipe(map(data => this.transformToObterImagensPorIdResponse(data)));
  }

  obterGestaoBannerPaginado(pageIndex: number = 0, pageSize: number = 25, filtro: BannerFiltro = null, sort: string = null): Observable<ObterBannersPaginadoResponse> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize)

    if (sort) { params = params.append('sort', sort); }

    if (filtro) {
      Object.keys(filtro).forEach((key) => {
        if (filtro[key]) {
          if (key === 'bannerId' || key === 'tipoBanner' || key === 'status') {
            filtro[key].forEach((value) => {
              params = params.append(key, value);
            });
          }
          else { params = params.append(key, filtro[key]) }
        }
      })
    }

    return this.http.get<ObterBannersPaginadoResponse>(this.getAPIBanner(), { params: params })
      .pipe(map(data => this.transformToObterBannersPaginadoResponse(data)));
  }

  criarBanner(banner: CriarBannerRequest) {
    return this.http
      .post<CriarBannerRequest>(this.getAPIBanner(), banner)
      .pipe(map((data) => this.transformToCriarBannerResponse(data)));
  }

  obterBannerPorId(bannerId: number): Observable<ObterBannerPorIdResponse> {
    let url = `${this.getAPIBanner()}/${bannerId}`;

    return this.http.get<ObterBannerPorIdResponse>(url)
      .pipe(map((data) => this.transformToObterBannerPorId(data)));
  }

  editarBanner(banner: CriarBannerRequest) {
    let url = `${this.getAPIBanner()}`;

    return this.http
      .put<CriarBannerResponse>(url, banner)
      .pipe(map((data) => this.transformToCriarBannerResponse(data)));
  }

  ativarBanner(bannerId: number) {
    let url = `${this.getAPIBanner()}/${bannerId}/ativar`;

    return this.http.put<AtivarInativarBannerResponse>(url, null)
      .pipe(map(data => this.transformToAtivarInativarBanner(data)));
  }

  inativarBanner(bannerId: number): Observable<AtivarInativarBannerResponse> {
    let url = `${this.getAPIBanner()}/${bannerId}/inativar`;

    return this.http.delete<AtivarInativarBannerResponse>(url)
      .pipe(map(data => this.transformToAtivarInativarBanner(data)));
  }

  private transformToObterImagensResponse(data: any): ObterConfigImagensResponse {
    let response: ObterConfigImagensResponse = new ObterConfigImagensResponse();

    if (data.isSuccessful) {
      response.totalItems = data.result.totalItems;
      response.imagens = data.result.imagens;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName)
    })
  }

  private transformToAtivarInativarImagem(data: any): AtivarInativarConfigImagemResponse {
    let response: AtivarInativarConfigImagemResponse = new AtivarInativarConfigImagemResponse();

    if (data.isSuccessful) {
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });

    return response;
  }


  private transformToCriarConfigImagemResponse(
    data: any
  ): CriarConfigImagemResponse {
    let response: CriarConfigImagemResponse =
      new CriarConfigImagemResponse();

    if (data.isSuccessful) {
      return response;
    };

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });

    return response;
  }

  private transformToAtualizarImagemResponse(
    data: any
  ): CriarConfigImagemResponse {
    let response: CriarConfigImagemResponse =
      new CriarConfigImagemResponse();

    if (data.isSuccessful) {
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });

    return response;
  }

  private transformToObterImagensPorIdResponse(
    data: any
  ): ObterImagensPorIdResponse {
    let response: ObterImagensPorIdResponse =
      new ObterImagensPorIdResponse();

    if (data.isSuccessful) {
      response.id = data.result.id;
      response.dominioId = data.result.dominioId;
      response.tamanhoArquivoDetran = data.result.tamanhoArquivoDetran;
      response.tamanhoArquivoTbk = data.result.tamanhoArquivoTbk;
      response.converteExtensao = data.result.converteExtensao;
      response.converteTamanho = data.result.converteTamanho;
      response.envioDetran = data.result.envioDetran;
      response.tipoArquivoDetran = data.result.tipoArquivoDetran;
      response.tipoArquivoTbk = data.result.tipoArquivoTbk;

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });

    return response;
  }

  private transformToObterDetransResponse(data: any): ObterDetransResponse {
    let response: ObterDetransResponse = new ObterDetransResponse();

    if (data.isSuccessful) {
      response.detrans = data.result.detrans;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName)
    })
  }

  private getAPIBanner(): string {
    return `${this.api}/banner/portal`;
  }

  private transformToObterBannersPaginadoResponse(data: any): ObterBannersPaginadoResponse {
    let response: ObterBannersPaginadoResponse = new ObterBannersPaginadoResponse()

    if (data.isSuccessful) {
      response.totalItems = data.result.totalItems;
      response.banners = data.result.banners;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToCriarBannerResponse(data: any): CriarBannerResponse {
    let response: CriarBannerResponse = new CriarBannerResponse();

    if (data.isSuccessful) {
      response = <CriarBannerResponse>{
        id: data.result.id
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToObterBannerPorId(data: any): ObterBannerPorIdResponse {
    let response: ObterBannerPorIdResponse = new ObterBannerPorIdResponse();

    if (data.isSuccessful) {
      response = <ObterBannerPorIdResponse>{
        id: data.result.id,
        titulo: data.result.titulo,
        tipoBanner: data.result.tipoBanner,
        tipoFrequencia: data.result.tipoFrequencia,
        agendar: data.result.agendar,
        dataInicio: data.result.dataInicio,
        dataFim: data.result.dataFim,
        statusBannerPortalId: data.result.statusBannerPortalId,
        nomeArquivoImagem: data.result.nomeArquivoImagem,
        urlImagem: data.result.urlImagem,
        imagemBase64: data.result.imagemBase64,
        urlLinkDirecionamento: data.result.urlLinkDirecionamento
      }
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToAtivarInativarBanner(data: any): AtivarInativarBannerResponse {
    let response: AtivarInativarBannerResponse = new AtivarInativarBannerResponse()

    if (data.isSuccessful) {
      response = data.result;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }
}
