import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { Veiculo } from '../../core/models/_portal/contratos/veiculo.model';
import { DetalheGravame } from '../../core/models/_portal/gravame/detalhe-gravame.model';
import { DadosInconsistenciasContrato } from '../../core/models/_portal/inconsistencias-contrato/dados-inconsistencias-contrato.model';
import { AlterarContratoRequest } from '../../core/requests/_portal/contratos/alterar-contrato.request';
import { ConsultarContratoRequest } from '../../core/requests/_portal/contratos/consultar-contrato.request';
import { RegistrarContratoRequest } from '../../core/requests/_portal/contratos/registrar-contrato.request';
import { RegistrarImagemRequest } from '../../core/requests/_portal/contratos/registrar-imagem.request';
import { AlterarContratoResponse } from '../../core/responses/_portal/contrato/alterar-contrato.response';
import { ConsultarContratoVeiculoResponse } from '../../core/responses/_portal/contrato/consultar-contrato-veiculo.response';
import { ConsultarContratoResponse } from '../../core/responses/_portal/contrato/consultar-contrato.response';
import { ConsultarDadosDevedorResponse } from '../../core/responses/_portal/contrato/consultar-dados-devedor.response';
import { ConsultarGravameResponse } from '../../core/responses/_portal/contrato/consultar-gravame.response';
import { EnviarImagemResponse } from '../../core/responses/_portal/contrato/enviar-imagem.response';
import { GravameResponse } from '../../core/responses/_portal/contrato/gravame.response';
import { ObterImagemResponse } from '../../core/responses/_portal/contrato/obter-imagem.response';
import { ReenvioContratoResponse } from '../../core/responses/_portal/contrato/reenvio-contrato.response';
import { RegistrarContratoResponse } from '../../core/responses/_portal/contrato/registrar-contrato.response';
import { ObterInconsistenciasContratoResponse } from '../../core/responses/_portal/contrato/visualizar-inconsistencias.response';
import { IContratoService } from '../interfaces/contrato.interface.service';
import { ConsultaContratoDetranRequest } from '../../core/requests/_portal/contratos/consulta-contrato-detran.request';
import { ConsultarContratoDetranResponse } from '../../core/responses/_portal/contrato/consultar-contrato-detran.response';
import { InconsistenciasContratoResponse } from '../../core/responses/_portal/contrato/obter-inconsistencias-contrato.response';

@Injectable({
  providedIn: 'root'
})
export class ContratoService implements IContratoService {

  private _contrato: BehaviorSubject<ConsultarContratoResponse> = new BehaviorSubject(null);
  public contrato$ = this._contrato.asObservable().pipe(filter(contrato => !!contrato));

  private _protocoloOrigem: BehaviorSubject<string> = new BehaviorSubject(null);
  public protocoloOrigem$ = this._protocoloOrigem.asObservable().pipe(filter(protocoloOrigem => !!protocoloOrigem));

  private _gravameResponse: BehaviorSubject<GravameResponse> = new BehaviorSubject(null);
  public gravameResponse$ = this._gravameResponse.asObservable().pipe(filter(gravameResponse => !!gravameResponse));

  private _dadosGravame: BehaviorSubject<DetalheGravame> = new BehaviorSubject(null);
  public dadosGravame$ = this._dadosGravame.asObservable().pipe(filter(dadosGravame => !!dadosGravame));

  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  registrarContrato(contrato: RegistrarContratoRequest): Observable<RegistrarContratoResponse> {

    let url = this.appSettings.baseUrlApiPortal + 'contratos';

    return this.http.post<RegistrarContratoResponse>(url, contrato)
      .pipe(map(data => this.transformToRegistrarContratoResponse(data)));

  }

  alterarContrato(contrato: AlterarContratoRequest): Observable<AlterarContratoResponse> {
    let url = this.appSettings.baseUrlApiPortal + 'contratos';

    return this.http.put<AlterarContratoResponse>(url, contrato)
      .pipe(map(data => this.transformToAlterarContratoResponse(data)));
  }

  consultarContratoPorProtocolo(protocolo: string, anonimizar: boolean = true) {
    let url = `${this.appSettings.baseUrlApiPortal}contratos/${protocolo}/protocolo`;

    const params = new HttpParams()
      .set('anonimizar', anonimizar)

    return this.http.get<ConsultarContratoResponse>(url, { params: params })
      .pipe(map(data => this.transformToConsultarContratoResponse(data)));
  }

  consultarContratoPorProtocoloBackoffice(protocolo: string) {
    let url = `${this.appSettings.baseUrlApiPortal}contratos/backoffice/${protocolo}/protocolo`;

    return this.http.get<ConsultarContratoResponse>(url)
      .pipe(map(data => this.transformToConsultarContratoResponse(data)));
  }

  consultarContrato(contrato: ConsultarContratoRequest) {
    let url = this.appSettings.baseUrlApiPortal + 'contratos/' + contrato.numeroContrato + '/numeroContrato/' + contrato.uf + '/uf';

    const params = new HttpParams()
      .set('tipoOperacao', contrato.tipoOperacao)
      .set('statusTransacao', contrato.statusTransacao)

    return this.http.get<ConsultarContratoResponse>(url, { params: params })
      .pipe(map(data => this.transformToConsultarContratoResponse(data)));
  }

  consultarContratoVeiculo(protocoloOrigem: string): Observable<ConsultarContratoVeiculoResponse> {
    let url = this.appSettings.baseUrlApiPortal + 'contratos/' + protocoloOrigem + "/protocolo";

    const params = new HttpParams()
      .set('fields', 'Veiculo');

    return this.http.get<ConsultarContratoVeiculoResponse>(url, { params: params })
      .pipe(map(data => this.transformToContratoVeiculoResponse(data)))
  }

  enviarImagem(protocolo: string, registrarImagemRequest: RegistrarImagemRequest): Observable<any> {
    let url = this.appSettings.baseUrlApiPortal + 'contratos/' + protocolo + '/imagem';

    return this.http.post<any>(url, registrarImagemRequest)
      .pipe(map(data => this.transformToEnviarImagemResponse(data)));
  }

  obterImagem(protocolo: string) {
    let url = this.appSettings.baseUrlApiPortal + `contratos/${protocolo}/imagem`;

    return this.http.get<any>(url)
      .pipe(map(data => this.transformToObterImagemResponse(data)));
  }

  obterImagemDownload(protocoloTransacao: string) {
    let url = this.appSettings.baseUrlApiPortal + `contratos/${protocoloTransacao}/imagemBase64`;

    return this.http.get<any>(url)
      .pipe(map(data => this.transformToObterImagemResponse(data)));
  }

  obterInconsistenciasContrato(protocolo: string): Observable<InconsistenciasContratoResponse> {
    let url = this.appSettings.baseUrlApiPortal + `contratos/${protocolo}/inconsistencias`;

    return this.http.get<InconsistenciasContratoResponse>(url)
      .pipe(map(data => this.transformToObterInconsistenciasContrato(data)));
  }

  obterInconsistenciasContratoContrato(protocolo: string): Observable<ObterInconsistenciasContratoResponse> {
    let url = this.appSettings.baseUrlApiPortal + `contratos/${protocolo}/inconsistencia-contrato`;

    return this.http.get<ObterInconsistenciasContratoResponse>(url)
      .pipe(map(data => this.transformToDadosInconsistenciaContrato(data)));
  }

  obterInconsistenciasContratoVeiculo(protocolo: string): Observable<ObterInconsistenciasContratoResponse> {
    let url = this.appSettings.baseUrlApiPortal + `contratos/${protocolo}/inconsistencia-veiculo`;

    return this.http.get<ObterInconsistenciasContratoResponse>(url)
      .pipe(map(data => this.transformToDadosInconsistenciaContrato(data)));
  }

  obterInconsistenciasContratoComplementar(protocolo: string): Observable<ObterInconsistenciasContratoResponse> {
    let url = this.appSettings.baseUrlApiPortal + `contratos/${protocolo}/inconsistencia-complementar`;

    return this.http.get<ObterInconsistenciasContratoResponse>(url)
      .pipe(map(data => this.transformToDadosInconsistenciaContrato(data)));
  }

  obterInconsistenciasContratoFinanciamento(protocolo: string): Observable<ObterInconsistenciasContratoResponse> {
    let url = this.appSettings.baseUrlApiPortal + `contratos/${protocolo}/inconsistencia-financiamento`;

    return this.http.get<ObterInconsistenciasContratoResponse>(url)
      .pipe(map(data => this.transformToDadosInconsistenciaContrato(data)));
  }

  obterInconsistenciasContratoCredor(protocolo: string): Observable<ObterInconsistenciasContratoResponse> {
    let url = this.appSettings.baseUrlApiPortal + `contratos/${protocolo}/inconsistencia-credor`;

    return this.http.get<ObterInconsistenciasContratoResponse>(url)
      .pipe(map(data => this.transformToDadosInconsistenciaContrato(data)));
  }

  obterInconsistenciasContratoDevedor(protocolo: string): Observable<ObterInconsistenciasContratoResponse> {
    let url = this.appSettings.baseUrlApiPortal + `contratos/${protocolo}/inconsistencia-devedor`;

    return this.http.get<ObterInconsistenciasContratoResponse>(url)
      .pipe(map(data => this.transformToDadosInconsistenciaContrato(data)));
  }

  reenvioContratoEditar(protocolo: string): Observable<ReenvioContratoResponse> {
    let url = this.appSettings.baseUrlApiPortal + `contratos/${protocolo}/contrato-reenvio/editar`;

    return this.http.get<ReenvioContratoResponse>(url)
      .pipe(map(data => this.transformToReenvioContrato(data)));
  }

  consultarGravame(uf: string, chassi: string): Observable<ConsultarGravameResponse> {
    let url = this.appSettings.baseUrlApiPortal + `contratos/consulta-gravame`;

    const params = new HttpParams()
      .set('uf', uf)
      .set('chassi', chassi);

    return this.http.get<ConsultarGravameResponse>(url, { params: params })
      .pipe(map(data => this.transformToConsultarGravame(data)));
  }

  consultarDadosDevedor(protocolo: string): Observable<ConsultarDadosDevedorResponse> {
    let url = `${this.appSettings.baseUrlApiPortal}contratos/${protocolo}/devedor`;

    return this.http.get<ConsultarDadosDevedorResponse>(url)
      .pipe(map(data => this.transformToConsultarDadosDevedorResponse(data)));
  }

  consultarContratoDetran(contratoRequest: ConsultaContratoDetranRequest) {
    let url = `${this.appSettings.baseUrlApiPortal}contratos/consulta-contrato-detran`;

    let params = new HttpParams();

    Object.keys(contratoRequest).forEach((key) => { params = params.append(key, contratoRequest[key]) });

    return this.http.get<ConsultarContratoDetranResponse>(url, { params: params })
      .pipe(map(data => this.transformToConsultarContratoDetran(data)));
  }

  getEmitirCertidao(data) {
    let params = new HttpParams()
      .set('protocolo', data.protocolo)
      .set('tipoCertidao', data.tipoCertidao)
      .set('tipoEnvio', data.tipoEnvio)

    if (data.tipoEnvio === 2) params = params.append('emailDestinatario', data.emailDestinatario)
    let url = this.appSettings.baseUrlApiPortal + 'contratos/emitir-certidao';
    return this.http.get(url, { params: params });
  }

  retornoContrato(contrato: ConsultarContratoResponse): void { this._contrato.next(contrato); }

  retornoProtocolo(protocoloOrigem: string): void { this._protocoloOrigem.next(protocoloOrigem); }

  //#region 

  private transformToRegistrarContratoResponse(data: any): RegistrarContratoResponse {
    let response: RegistrarContratoResponse = new RegistrarContratoResponse();

    if (data.isSuccessful) return response;

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    })

    return response;
  }

  private transformToAlterarContratoResponse(data: any): AlterarContratoResponse {
    let response: AlterarContratoResponse = new AlterarContratoResponse();

    if (data.isSuccessful) { return response; }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    })

    return response;
  }

  private transformToConsultarContratoResponse(data: any) {
    let response: ConsultarContratoResponse = new ConsultarContratoResponse();

    if (data.isSuccessful) {
      response = data.result;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName); })
    return response;
  }

  private transformToContratoVeiculoResponse(data: any): ConsultarContratoVeiculoResponse {
    let response: ConsultarContratoVeiculoResponse = new ConsultarContratoVeiculoResponse();

    if (data.isSuccessful) {
      response = <ConsultarContratoVeiculoResponse>{
        veiculo: <Veiculo>{
          chassi: data.result.veiculo?.chassi,
          placa: data.result.veiculo?.placa,
          ufPlaca: data.result.veiculo?.ufPlaca,
          anoFabricacao: data.result.veiculo?.anoFabricacao,
          anoModelo: data.result.veiculo?.anoModelo,
          renavam: data.result.veiculo?.renavam,
          marca: data.result.veiculo?.marca,
          modelo: data.result.veiculo?.modelo,
          emplacado: data.result.veiculo?.emplacado,
          remarcado: data.result.veiculo?.remarcado,
          especie: data.result.veiculo?.especie,
          cor: data.result.veiculo?.cor
        }
      }

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToEnviarImagemResponse(data: any): EnviarImagemResponse {
    let response: EnviarImagemResponse = new EnviarImagemResponse();

    if (data.isSuccessful) {
      response = <EnviarImagemResponse>{
        dataTransacao: data.result.dataTransacao,
        protocoloImagem: data.result.protocoloImagem,
        status: data.result.status,
        isSuccessful: true
      }

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToObterImagemResponse(data: any): ObterImagemResponse {
    let response: ObterImagemResponse = new ObterImagemResponse();

    if (data.isSuccessful) {
      response = <ObterImagemResponse>{
        existeImagem: data.result.existeImagem,
        imagem: data.result.imagem
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToObterInconsistenciasContrato(data: any): InconsistenciasContratoResponse {
    let response: InconsistenciasContratoResponse = new InconsistenciasContratoResponse();

    if (data.isSuccessful) {
      response.inconsistenciasContrato = data.result.inconsistenciasContrato;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message); })

    return response;
  }

  private transformToDadosInconsistenciaContrato(data: any): ObterInconsistenciasContratoResponse {
    let response: ObterInconsistenciasContratoResponse = new ObterInconsistenciasContratoResponse();

    if (data.isSuccessful) {
      response.categoria = data.result.categoria;
      data.result.dadoInconsistenciaContrato.forEach((value: DadosInconsistenciasContrato) => {
        response.dadoInconsistenciaContrato.push(value)
      });

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message); })

    return response;
  }

  private transformToReenvioContrato(data: any): ReenvioContratoResponse {
    let response: ReenvioContratoResponse = new ReenvioContratoResponse();

    if (data.isSuccessful) {
      response = data.result;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message); });
    return response;
  }

  private transformToConsultarGravame(data: any): ConsultarGravameResponse {
    let response: ConsultarGravameResponse = new ConsultarGravameResponse();

    if (data.isSuccessful) {
      response = data.result;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message); });
    return response;
  }

  private transformToConsultarDadosDevedorResponse(data: any): ConsultarDadosDevedorResponse {
    let response: ConsultarDadosDevedorResponse = new ConsultarDadosDevedorResponse();

    if (data.isSuccessful) {
      response = data.result;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message); });
    return response;
  }

  private transformToConsultarContratoDetran(data: any): ConsultarContratoDetranResponse {
    let response: ConsultarContratoDetranResponse = new ConsultarContratoDetranResponse();

    if (data.isSuccessful) {
      response.retorno = data.result.retorno;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message); })
    return response;
  }

  //#endregion
}
