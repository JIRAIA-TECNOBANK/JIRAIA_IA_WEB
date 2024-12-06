import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { filter, map } from 'rxjs/operators';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { PerfisFiltro } from '../core/models/perfis/perfis-filtro.model';
import { _oldCriarPerfilRequest } from '../core/requests/empresas/_old/criar-perfil.request';
import { AtualizarVersaoLotesRequest } from '../core/requests/empresas/atualizar-versao-lotes.request';
import { CriarCargoRequest } from '../core/requests/empresas/criar-cargo.request';
import { CriarContatoRequest } from '../core/requests/empresas/criar-contato.request';
import { CriarDepartamentoRequest } from '../core/requests/empresas/criar-departamento.request';
import { SubmitEmpresasRequest } from '../core/requests/empresas/criar-empresa.request';
import { CriarEnderecoDetranEmpresaRequest } from '../core/requests/empresas/criar-endereco-detran-empresa.request';
import { CriarEnderecoRequest } from '../core/requests/empresas/criar-endereco.request';
import { EnvioEmailRequest } from '../core/requests/empresas/envio-email.request';
import { ObterEmpresasGrupoRequest } from '../core/requests/empresas/obter-empresas-grupo.request';
import { ObterEnderecoDetranEmpresaResponse } from '../core/requests/empresas/obter-endereco-detran-empresa.response';
import { AssociarProdutosEmpresaResponse } from '../core/responses/empresas/associar-produtos-empresa.response';
import { AtivarInativarDetranResponse } from '../core/responses/empresas/ativar-inativar-detran.response';
import { AtivarInativarEmpresaResponse } from '../core/responses/empresas/ativar-inativar-empresa.response';
import { AtualizarEmpresaContatoResponse } from '../core/responses/empresas/atualizar-empresa-contato.response';
import { AtualizarEmpresaEnderecoResponse } from '../core/responses/empresas/atualizar-empresa-endereco.response';
import { AtualizarEmpresaResponse } from '../core/responses/empresas/atualizar-empresa.response';
import { AtualizarEnderecoDetranEmpresaResponse } from '../core/responses/empresas/atualizar-endereco-detran-empresa.response';
import { AtualizarPerfilResponse } from '../core/responses/empresas/atualizar-perfil.response';
import { AtualizarVersaoLoteResponse } from '../core/responses/empresas/atualizar-versao-lote.response';
import { CriarCargoResponse } from '../core/responses/empresas/criar-cargo.response';
import { CriarContatosResponse } from '../core/responses/empresas/criar-contatos.response';
import { CriarDepartamentoResponse } from '../core/responses/empresas/criar-departamento.response';
import { CriarEmpresasResponse } from '../core/responses/empresas/criar-empresas.response';
import { CriarEnderecoDetranEmpresaResponse } from '../core/responses/empresas/criar-endereco-detran-empresa.response';
import { CriarEnderecosResponse } from '../core/responses/empresas/criar-enderecos.response';
import { CriarPerfilResponse } from '../core/responses/empresas/criar-perfil.response';
import { DeleteContatoResponse } from '../core/responses/empresas/delete-contato.response';
import { DeleteEnderecoResponse } from '../core/responses/empresas/delete-endereco.response';
import { EnvioEmailResponse } from '../core/responses/empresas/envio-email.response';
import { ObterCargosEmpresaResponse } from '../core/responses/empresas/obter-cargos.response';
import { ObterContatosResponse } from '../core/responses/empresas/obter-contatos.response';
import { ObterDadosEmpresaResponse } from '../core/responses/empresas/obter-dados-empresa.response';
import { ObterDepartamentosEmpresaResponse } from '../core/responses/empresas/obter-departamentos-empresa.response';
import { ObterDetransResponse } from '../core/responses/empresas/obter-detrans.response';
import { ObterEmpresaResponse } from '../core/responses/empresas/obter-empresa.response';
import { ObterEmpresasEnderecoPrincipalResponse } from '../core/responses/empresas/obter-empresas-endereco-principal.response';
import { ObterEmpresasPaginationResponse } from '../core/responses/empresas/obter-empresas-pagination.response';
import { ObterEnderecosResponse } from '../core/responses/empresas/obter-enderecos.response';
import { ObterProdutosEmpresaResponse } from '../core/responses/empresas/obter-produtos-empresa.response';
import { ObterUfsProdutoEmpresaResponse } from '../core/responses/empresas/obter-ufs-produto-empresa.response';
import { ObterPerfisResponse } from '../core/responses/perfis/obter-perfis.response';
import { IEmpresasService } from './interfaces/empresas.interface.service';

@Injectable()
export class EmpresasService implements IEmpresasService {
  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApiCRM}empresas`;

  private _empresaId: BehaviorSubject<number> = new BehaviorSubject(null);
  public empresaId$ = this._empresaId
    .asObservable()
    .pipe(filter((empresaId) => !!empresaId));

  /**
   *
   * @param empresaId (Retorno do empresaId, para limpar, envie como 'nodata')
   */
  setEmpresaId(empresaId: any): void {
    this._empresaId.next(empresaId);
  }

  //#region Empresas

  obterEmpresas(
    pageIndex: number = 0,
    pageSize: number = 5,
    nome: string = '',
    ativo: string = ''
  ): Observable<ObterEmpresasPaginationResponse> {
    const params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize)
      .set('nome', nome)
      .set('ativo', ativo);
    return this.http
      .get<ObterEmpresasPaginationResponse>(this.api, { params: params })
      .pipe(map((data) => this.transformToObterEmpresasResponse(data)));
  }

  criarEmpresa(empresa: SubmitEmpresasRequest) {
    return this.http
      .post<CriarEmpresasResponse>(this.api, empresa)
      .pipe(map((data) => this.transformToCriarEmpresaResponse(data)));
  }

  obterEmpresa(empresaId: number) {
    let url = `${this.api}/${empresaId}`;

    return this.http
      .get<ObterEmpresaResponse>(url)
      .pipe(map((data) => this.transformToObterEmpresaResponse(data)));
  }

  atualizarEmpresa(empresaId: number, empresa: SubmitEmpresasRequest) {
    let url = `${this.api}/${empresaId}`;

    return this.http
      .put<AtualizarEmpresaResponse>(url, empresa)
      .pipe(map((data) => this.transformToAtualizarEmpresaResponse(data)));
  }

  ativarEmpresa(empresaId: string): Observable<AtivarInativarEmpresaResponse> {
    let url = `${this.api}/${empresaId}/ativar`;

    return this.http
      .put<AtivarInativarEmpresaResponse>(url, null)
      .pipe(map((data) => this.transformToAtivarInativarEmpresaResponse(data)));
  }

  inativarEmpresa(
    empresaId: string
  ): Observable<AtivarInativarEmpresaResponse> {
    let url = `${this.api}/${empresaId}/inativar`;

    return this.http
      .delete<AtivarInativarEmpresaResponse>(url)
      .pipe(map((data) => this.transformToAtivarInativarEmpresaResponse(data)));
  }

  validarDuplicidadeCnpj(cnpj: string): Observable<ObterEmpresaResponse> {
    let url = `${this.api}/${cnpj}`;

    return this.http
      .get<ObterEmpresaResponse>(url)
      .pipe(map((data) => this.transformToValidarDuplicidadeCnpj(data)));
  }

  obterEmpresasFiltro(
    pageIndex: number = 0,
    pageSize: number = 5,
    filtro: string = '',
    ativo: string = '',
    tipoRelatorio: string = ''
  ): Observable<ObterEmpresasPaginationResponse> {
    let url = `${this.api}/filtro`;
    const params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize)
      .set('filtro', filtro)
      .set('tipoRelatorio', tipoRelatorio)
      .set('ativo', ativo);

    return this.http
      .get<ObterEmpresasPaginationResponse>(url, { params: params })
      .pipe(map((data) => this.transformToObterEmpresasResponse(data)));
  }

  obterEmpresasExternasFiltro(
    pageIndex: number = 0,
    pageSize: number = 5,
    grupoEconomicoId: number,
    filtro: string = '',
    ativo: string = '',
    tipoRelatorio: string = ''
  ): Observable<ObterEmpresasPaginationResponse> {
    let url = `${this.api}/externas/filtro`;
    const params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize)
      .set('grupoEconomicoId', grupoEconomicoId)
      .set('filtro', filtro)
      .set('tipoRelatorio', tipoRelatorio)
      .set('ativo', ativo);

    return this.http
      .get<ObterEmpresasPaginationResponse>(url, { params: params })
      .pipe(map((data) => this.transformToObterEmpresasResponse(data)));
  }


  consultaEmpresas(
    pageIndex: number = 0,
    pageSize: number = 25,
    filtro: any = ''
  ): Observable<ObterEmpresasPaginationResponse> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize);
    if (filtro) {
      Object.keys(filtro).forEach((key) => {
        if (filtro[key] !== '' || filtro[key].length !== 0) {
          if (key == 'empresaId') {
            filtro[key].forEach((value) => {
              params = params.append(key, value);
            });
          } else params = params.append(key, filtro[key]);
        }
      });
    }

    return this.http
      .get<ObterEmpresasPaginationResponse>(this.api, { params: params })
      .pipe(map((data) => this.transformToObterEmpresasResponse(data)));
  }

  envioEmailImgPendentes(
    envioEmail: EnvioEmailRequest
  ): Observable<EnvioEmailResponse> {
    let url = `${this.api}/imagens-pendentes`;

    return this.http
      .post<EnvioEmailResponse>(url, envioEmail)
      .pipe(map((data) => this.transformToEnvioEmailImgPendentes(data)));
  }

  atualizarVersoesLote(
    empresaId: number,
    versoesLotesIds: AtualizarVersaoLotesRequest
  ): Observable<AtualizarVersaoLoteResponse> {
    let url = `${this.api}/${empresaId}/vincular-versao-lote`;

    return this.http
      .put<AtualizarVersaoLoteResponse>(url, versoesLotesIds)
      .pipe(map((data) => this.transformToAtualizarVersaoLoteResponse(data)));
  }

  obterDadosEmpresa(empresaId: number): Observable<ObterDadosEmpresaResponse> {
    let url = `${this.api}/${empresaId}`;

    return this.http
      .get<ObterDadosEmpresaResponse>(url)
      .pipe(map((data) => this.transformToObterDadosEmpresaResponse(data)));
  }

  obterEmpresasDoGrupo(filtro: ObterEmpresasGrupoRequest) {
    let url = `${this.api}/grupo-economico`;

    let params = new HttpParams()
      .set('pageIndex', 0)
      .set('pageSize', 200)
      .set('sort', 'nomeFantasia.asc');

    Object.keys(filtro).forEach(key => {
      params = params.append(key, filtro[key]);
    });

    return this.http.get(url, { params })
      .pipe(map(data => this.transformToObterEmpresasGrupoResponse(data)));
  }

  //#region Privates

  private transformToObterEmpresasResponse(
    data: any
  ): ObterEmpresasPaginationResponse {
    let response: ObterEmpresasPaginationResponse =
      new ObterEmpresasPaginationResponse();

    if (data.isSuccessful) {
      response.totalItems = data.result.totalItems;
      response.empresas = data.result.empresas;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
  }

  private transformToCriarEmpresaResponse(data: any): CriarEmpresasResponse {
    let response: CriarEmpresasResponse = new CriarEmpresasResponse();

    if (data.isSuccessful) {
      response = <CriarEmpresasResponse>{
        empresaId: data.result.empresaId,
        nomeFantasia: data.result.nomeFantasia,
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToAtualizarEmpresaResponse(
    data: any
  ): AtualizarEmpresaResponse {
    let response: AtualizarEmpresaResponse = new AtualizarEmpresaResponse();

    if (data.isSuccessful) {
      response = <AtualizarEmpresaResponse>{
        empresaId: data.result.empresaId,
        nomeFantasia: data.result.nomeFantasia,
        razaoSocial: data.result.razaoSocial,
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToObterEmpresaResponse(data: any): ObterEmpresaResponse {
    let response: ObterEmpresaResponse = new ObterEmpresaResponse();

    if (data.isSuccessful) {
      response = <ObterEmpresaResponse>{
        id: data.result.id,
        nomeFantasia: data.result.nomeFantasia,
        cnpj: data.result.cnpj,
        razaoSocial: data.result.razaoSocial,
        ativo: data.result.ativo,
        grupoEconomico: data.result.grupoEconomico,
        comercialResponsavelId: data.result.comercialResponsavelId,
        criadoEm: data.result.criadoEm,
        email: data.result.email,
        inscricaoEstadual: data.result.inscricaoEstadual,
        inscricaoMunicipal: data.result.inscricaoMunicipal,
        modificadoEm: data.result.modificadoEm,
        responsavelComercial: data.result.responsavelComercial,
        telefone: data.result.telefone,
        tipoEmpresa: data.result.tipoEmpresa,
        tipoEmpresaId: data.result.tipoEmpresaId,
        versoesLote: data.result.versoesLote,
        cadastroOriginadoContran: data.result.cadastroOriginadoContran
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToAtivarInativarEmpresaResponse(
    data: any
  ): AtivarInativarEmpresaResponse {
    let response: AtivarInativarEmpresaResponse =
      new AtivarInativarEmpresaResponse();

    if (data.isSuccessful) {
      response.empresaId = data.result.empresaId;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToValidarDuplicidadeCnpj(data: any): ObterEmpresaResponse {
    let response: ObterEmpresaResponse = new ObterEmpresaResponse();

    if (data.isSuccessful) {
      response = data.result;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToEnvioEmailImgPendentes(data: any): EnvioEmailResponse {
    let response: EnvioEmailResponse = new EnvioEmailResponse();
    if (data.isSuccessful) {
      response = data;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToAtualizarVersaoLoteResponse(
    data: any
  ): AtualizarVersaoLoteResponse {
    let response: AtualizarVersaoLoteResponse =
      new AtualizarVersaoLoteResponse();

    if (data.isSuccessful) {
      response.empresaId = data.result.empresaId;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToObterDadosEmpresaResponse(
    data: any
  ): ObterDadosEmpresaResponse {
    let response: ObterDadosEmpresaResponse = new ObterDadosEmpresaResponse();

    if (data.isSuccessful) {
      response = data.result;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToObterEmpresasGrupoResponse(data: any): ObterEmpresasPaginationResponse {
    let response: ObterEmpresasPaginationResponse = new ObterEmpresasPaginationResponse();

    if (data.isSuccessful) {
      response.empresas = data.result.empresas;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  //#endregion

  //#region Contatos
  criarEmpresaContato(
    empresaId: number,
    contato: CriarContatoRequest
  ): Observable<CriarContatosResponse> {
    let url = `${this.api}/${empresaId}/contato-adicional`;

    return this.http
      .post<CriarContatosResponse>(url, contato)
      .pipe(map((data) => this.transformToCriarContatoResponse(data)));
  }

  atualizarEmpresaContato(
    empresaId: number,
    contatoId: number,
    contato: CriarContatoRequest
  ): Observable<AtualizarEmpresaContatoResponse> {
    let url = `${this.api}/${empresaId}/contato-adicional/${contatoId}`;

    return this.http
      .put<AtualizarEmpresaContatoResponse>(url, contato)
      .pipe(
        map((data) => this.transformToAtualizarContatoEmpresaResponse(data))
      );
  }

  deleteContato(
    empresaId: number,
    contatoId: number
  ): Observable<DeleteContatoResponse> {
    let url = `${this.api}/${empresaId}/contato-adicional/${contatoId}`;

    return this.http
      .delete<DeleteContatoResponse>(url)
      .pipe(map((data) => this.transformToDeleteContatoResponse(data)));
  }

  obterEmpresaContatos(
    empresaId: number,
    pageIndex: number = 0,
    pageSize: number = 10
  ): Observable<ObterContatosResponse> {
    let url = `${this.api}/${empresaId}/contato-adicional`;

    const params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize);

    return this.http
      .get<ObterContatosResponse>(url, { params: params })
      .pipe(map((data) => this.transformToObterEmpresaContatosResponse(data)));
  }
  //#endregion

  //#region Endereços

  criarEmpresaEndereco(
    empresaId: number,
    endereco: CriarEnderecoRequest
  ): Observable<CriarEnderecosResponse> {
    let url = `${this.api}/${empresaId}/enderecos`;

    return this.http
      .post<CriarEnderecosResponse>(url, endereco)
      .pipe(map((data) => this.transformToCriarEnderecoResponse(data)));
  }

  obterEmpresasEndereco(
    empresaId: number,
    pageIndex: number = 0,
    pageSize: number = 10
  ): Observable<ObterEnderecosResponse> {
    let url = `${this.api}/${empresaId}/enderecos`;

    const params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize);

    return this.http
      .get<ObterEnderecosResponse>(url, { params: params })
      .pipe(map((data) => this.transformToObterEmpresasEnderecoResponse(data)));
  }

  atualizarEmpresasEndereco(
    empresaId: number,
    enderecoId: number,
    endereco: CriarEnderecoRequest
  ): Observable<AtualizarEmpresaEnderecoResponse> {
    let url = `${this.api}/${empresaId}/enderecos/${enderecoId}`;

    return this.http
      .put<AtualizarEmpresaEnderecoResponse>(url, endereco)
      .pipe(
        map((data) => this.transformToAtualizarEnderecoEmpresaResponse(data))
      );
  }

  obterEmpresasEnderecoPrincipal(
    empresaId: number
  ): Observable<ObterEmpresasEnderecoPrincipalResponse> {
    let url = `${this.api}/${empresaId}/enderecos/principal`;

    return this.http
      .get<ObterEmpresasEnderecoPrincipalResponse>(url)
      .pipe(
        map((data) =>
          this.transformToObterEmpresasEnderecoPrincipalResponse(data)
        )
      );
  }

  deleteEndereco(
    empresaId: number,
    enderecoId: number
  ): Observable<DeleteEnderecoResponse> {
    let url = `${this.api}/${empresaId}/enderecos/${enderecoId}`;

    return this.http
      .delete<DeleteEnderecoResponse>(url)
      .pipe(map((data) => this.transformToDeleteEnderecoResponse(data)));
  }

  //#region Privates

  private transformToCriarContatoResponse(data: any): CriarContatosResponse {
    let response: CriarContatosResponse = new CriarContatosResponse();

    if (data.isSuccessful) {
      response.contato = data.result.endereco;
      response = <CriarContatosResponse>{
        contato: data.result.contato,
        empresaId: data.result.empresaId,
      };
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToAtualizarContatoEmpresaResponse(
    data: any
  ): AtualizarEmpresaContatoResponse {
    let response: AtualizarEmpresaContatoResponse =
      new AtualizarEmpresaContatoResponse();

    if (data.isSuccessful) {
      response = <AtualizarEmpresaContatoResponse>{
        contato: data.result.contato,
        empresaId: data.result.empresaId,
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToDeleteContatoResponse(data: any): DeleteContatoResponse {
    let response: DeleteContatoResponse = new DeleteContatoResponse();

    if (data.isSuccessful) {
      response.empresaId = data.result.empresaId;
      response.contatoId = data.result.enderecoId;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToObterEmpresaContatosResponse(
    data: any
  ): ObterContatosResponse {
    let response: ObterContatosResponse = new ObterContatosResponse();

    if (data.isSuccessful) {
      response = <ObterContatosResponse>{
        contatosAdicionais: data.result.contatosAdicionais,
      };
      return response;
    }
  }

  private transformToCriarEnderecoResponse(data: any): CriarEnderecosResponse {
    let response: CriarEnderecosResponse = new CriarEnderecosResponse();

    if (data.isSuccessful) {
      response.endereco = data.result.endereco;
      response = <CriarEnderecosResponse>{
        endereco: data.result.endereco,
        enderecoPrincipal: data.result.enderecoPrincipal,
        empresaId: data.result.empresaId,
      };
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToObterEmpresasEnderecoResponse(
    data: any
  ): ObterEnderecosResponse {
    let response: ObterEnderecosResponse = new ObterEnderecosResponse();

    if (data.isSuccessful) {
      response = <ObterEnderecosResponse>{
        pageIndex: data.result.pageIndex,
        totalItems: data.result.totalItems,
        enderecos: data.result.enderecos,
      };
      return response;
    }
  }

  private transformToObterEmpresasEnderecoPrincipalResponse(
    data: any
  ): ObterEmpresasEnderecoPrincipalResponse {
    let response: ObterEmpresasEnderecoPrincipalResponse =
      new ObterEmpresasEnderecoPrincipalResponse();

    if (data.isSuccessful) {
      response = <ObterEmpresasEnderecoPrincipalResponse>{
        endereco: data.result.endereco,
        id: data.result.id,
      };
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToAtualizarEnderecoEmpresaResponse(
    data: any
  ): AtualizarEmpresaEnderecoResponse {
    let response: AtualizarEmpresaEnderecoResponse =
      new AtualizarEmpresaEnderecoResponse();

    if (data.isSuccessful) {
      response = <AtualizarEmpresaEnderecoResponse>{
        endereco: data.result.endereco,
        enderecoPrincipal: data.result.enderecoPrincipal,
        empresaId: data.result.empresaId,
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToDeleteEnderecoResponse(data: any): DeleteEnderecoResponse {
    let response: DeleteEnderecoResponse = new DeleteEnderecoResponse();

    if (data.isSuccessful) {
      response.empresaId = data.result.empresaId;
      response.enderecoId = data.result.enderecoId;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  //#endregion

  //#endregion

  //#region Produtos

  obterProdutosPorEmpresa(
    empresaId: number
  ): Observable<ObterProdutosEmpresaResponse> {
    let url = `${this.api}/${empresaId}/produtos`;

    return this.http
      .get<ObterProdutosEmpresaResponse>(url)
      .pipe(map((data) => this.transformToObterProdutosEmpresaResponse(data)));
  }

  associarProdutoEmpresa(empresaId: number, produtoId: number) {
    let url = `${this.api}/${empresaId}/produtos/${produtoId}`;

    return this.http
      .post<AssociarProdutosEmpresaResponse>(url, null)
      .pipe(
        map((data) => this.transformToAssociarProdutosEmpresaResponse(data))
      );
  }

  //#region DETRANS
  obterUfsProdutoEmpresa(
    empresaId: number
  ): Observable<ObterUfsProdutoEmpresaResponse> {
    let url = `${this.api}/${empresaId}/detrans`;

    return this.http
      .get<ObterUfsProdutoEmpresaResponse>(url)
      .pipe(
        map((data) => this.transformToObterUfsProdutoEmpresaResponse(data))
      );
  }

  criarEnderecoDetran(
    empresaId: number,
    enderecoDetran: CriarEnderecoDetranEmpresaRequest
  ): Observable<CriarEnderecoDetranEmpresaResponse> {
    let url = `${this.api}/${empresaId}/detrans`;

    return this.http
      .post<CriarEnderecoDetranEmpresaResponse>(url, enderecoDetran)
      .pipe(map((data) => this.transformToCriarEnderecoDetran(data)));
  }

  obterEnderecoUfDetran(
    empresaId: number,
    detranId: number
  ): Observable<ObterEnderecoDetranEmpresaResponse> {
    let url = `${this.api}/${empresaId}/detrans/${detranId}/enderecos`;

    return this.http
      .get<ObterEnderecoDetranEmpresaResponse>(url)
      .pipe(map((data) => this.transformToObterEnderecoUfDetranResponse(data)));
  }

  atualizarEnderecoUfDetran(
    empresaId: number,
    detranId: number,
    enderecoDetran: CriarEnderecoDetranEmpresaRequest
  ): Observable<AtualizarEnderecoDetranEmpresaResponse> {
    let url = `${this.api}/${empresaId}/detrans/${detranId}`;

    return this.http
      .put<AtualizarEnderecoDetranEmpresaResponse>(url, enderecoDetran)
      .pipe(map((data) => this.transformToAtualizarEnderecoUfDetran(data)));
  }

  ativarUfDetran(
    empresaId: number,
    detranId: number
  ): Observable<AtivarInativarDetranResponse> {
    let url = `${this.api}/${empresaId}/detrans/${detranId}/ativar`;

    return this.http
      .put<AtivarInativarDetranResponse>(url, null)
      .pipe(
        map((data) => this.transformToAtivarInativarUfDetranResponse(data))
      );
  }

  inativarUfDetran(
    empresaId: number,
    detranId: number
  ): Observable<AtivarInativarDetranResponse> {
    let url = `${this.api}/${empresaId}/detrans/${detranId}/inativar`;

    return this.http
      .delete<AtivarInativarDetranResponse>(url)
      .pipe(
        map((data) => this.transformToAtivarInativarUfDetranResponse(data))
      );
  }

  obterDetrans(usuarioGuid: string): Observable<ObterDetransResponse> {
    let url = `${this.api}/${usuarioGuid}/detrans`;

    return this.http
      .get<ObterDetransResponse>(url)
      .pipe(map((data) => this.transformToObterDetransResponse(data)));
  }

  //#endregion

  //#region Privates

  private transformToObterProdutosEmpresaResponse(
    data: any
  ): ObterProdutosEmpresaResponse {
    let response: ObterProdutosEmpresaResponse =
      new ObterProdutosEmpresaResponse();

    if (data.isSuccessful) {
      response = <ObterProdutosEmpresaResponse>{
        produtos: data.result.produtos,
      };
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToAssociarProdutosEmpresaResponse(
    data: any
  ): AssociarProdutosEmpresaResponse {
    let response: AssociarProdutosEmpresaResponse =
      new AssociarProdutosEmpresaResponse();

    if (data.isSuccessful) {
      response = <AssociarProdutosEmpresaResponse>{
        produto: data.result.produto,
        empresa: data.result.empresa,
      };
      return response;
    }
  }

  private transformToObterDetransResponse(data: any): ObterDetransResponse {
    let response: ObterDetransResponse = new ObterDetransResponse();

    if (data.isSuccessful) {
      response.detrans = data.result.detrans;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    });
    return response;
  }

  //#region DETRANS

  private transformToObterUfsProdutoEmpresaResponse(
    data: any
  ): ObterUfsProdutoEmpresaResponse {
    let response: ObterUfsProdutoEmpresaResponse =
      new ObterUfsProdutoEmpresaResponse();

    if (data.isSuccessful) {
      response = <ObterUfsProdutoEmpresaResponse>{
        detrans: data.result.detrans,
      };
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToCriarEnderecoDetran(
    data: any
  ): CriarEnderecoDetranEmpresaResponse {
    let response: CriarEnderecoDetranEmpresaResponse =
      new CriarEnderecoDetranEmpresaResponse();

    if (data.isSuccessful) {
      response.detranId = data.result.detranId;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToObterEnderecoUfDetranResponse(
    data: any
  ): ObterEnderecoDetranEmpresaResponse {
    let response: ObterEnderecoDetranEmpresaResponse =
      new ObterEnderecoDetranEmpresaResponse();

    if (data.isSuccessful) {
      response = <ObterEnderecoDetranEmpresaResponse>{
        bairro: data.result.bairro,
        cep: data.result.cep,
        complemento: data.result.complemento,
        detranId: data.result.detranId,
        logradouro: data.result.logradouro,
        municipio: data.result.municipio,
        numero: data.result.numero,
        uf: data.result.uf,
        municipioId: data.result.municipioId,
        parametrizarDuda: data.result.parametrizarDuda,
        enderecoEmpresaId: data.result.enderecoEmpresaId,
        dataInicial: data.result.dataInicial,
        dataFinal: data.result.dataFinal,
      };
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToAtualizarEnderecoUfDetran(
    data: any
  ): AtualizarEnderecoDetranEmpresaResponse {
    let response: AtualizarEnderecoDetranEmpresaResponse =
      new AtualizarEnderecoDetranEmpresaResponse();

    if (data.isSuccessful) {
      response = data;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToAtivarInativarUfDetranResponse(
    data: any
  ): AtivarInativarDetranResponse {
    let response: AtivarInativarDetranResponse =
      new AtivarInativarDetranResponse();

    if (data.isSuccessful) {
      response = <AtivarInativarDetranResponse>{
        empresaId: data.result.empresaId,
        detranId: data.result.detranId,
        ativo: data.result.ativo,
      };
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }
  //#endregion

  //#endregion

  //#endregion

  //#region Perfis

  obterPerfis(empresaId: number, filtro: PerfisFiltro): Observable<ObterPerfisResponse> {
    let url = `${this.api}/${empresaId}/perfis`;

    let params = new HttpParams();

    Object.keys(filtro).forEach((key) => {
      if (filtro[key] !== '' || filtro[key].length !== 0) {
        if (key == 'perfilId') {
          filtro[key].forEach((value) => {
            params = params.append(key, value);
          });
        } else params = params.append(key, filtro[key]);
      }
    });

    return this.http
      .get<ObterPerfisResponse>(url, { params: params })
      .pipe(map((data) => this.transformToObterPerfisResponse(data)));
  }

  criarPerfil(empresaId: number, perfil: _oldCriarPerfilRequest) {
    let url = `${this.api}/${empresaId}/perfis`;

    return this.http
      .post<CriarPerfilResponse>(url, perfil)
      .pipe(map((data) => this.transformToCriarPerfilResponse(data)));
  }

  atualizarPerfil(
    empresaId: number,
    perfilId: number,
    criarPerfilRequest: _oldCriarPerfilRequest
  ): Observable<CriarPerfilResponse> {
    let url = `${this.api}/${empresaId}/perfis/${perfilId}`;

    return this.http
      .put<CriarPerfilResponse>(url, criarPerfilRequest)
      .pipe(map((data) => this.transformToCriarPerfilResponse(data)));
  }

  //#region Privates

  private transformToObterPerfisResponse(data: any): ObterPerfisResponse {
    let response: ObterPerfisResponse = new ObterPerfisResponse();

    if (data.isSuccessful) {
      response = <ObterPerfisResponse>{
        pageIndex: data.result.pageIndex,
        totalItems: data.result.totalItems,
        perfis: data.result.perfis,
      };
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToCriarPerfilResponse(data: any): CriarPerfilResponse {
    let response: CriarPerfilResponse = new CriarPerfilResponse();

    if (data.isSuccessful) {
      response = <CriarPerfilResponse>{
        perfilId: data.result.perfilId,
        nome: data.result.nome,
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToAtualizarPerfilResponse(
    data: any
  ): AtualizarPerfilResponse {
    let response: AtualizarPerfilResponse = new AtualizarPerfilResponse();

    if (data.isSuccessful) {
      response = <AtualizarPerfilResponse>{
        nome: data.result.nome,
        descricao: data.result.descricao,
        ativo: data.result.ativo,
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  //#endregion

  //#endregion

  //#region Departamentos

  criarDepartamento(
    empresaId: number,
    departamento: CriarDepartamentoRequest
  ): Observable<CriarDepartamentoResponse> {
    let url = `${this.api}/${empresaId}/departamentos`;

    return this.http
      .post<CriarDepartamentoResponse>(url, departamento)
      .pipe(map((data) => this.transformToCriarDepartamentoResponse(data)));
  }

  obterDepartamentos(
    empresaId: number
  ): Observable<ObterDepartamentosEmpresaResponse> {
    let url = `${this.api}/${empresaId}/departamentos`;

    return this.http
      .get<ObterDepartamentosEmpresaResponse>(url)
      .pipe(map((data) => this.transformToObterDepartamentosEmpresa(data)));
  }

  //#region Privates

  private transformToCriarDepartamentoResponse(
    data: any
  ): CriarDepartamentoResponse {
    let response: CriarDepartamentoResponse = new CriarDepartamentoResponse();

    if (data.isSuccessful) {
      response = <CriarDepartamentoResponse>{
        departamentoId: data.result.departamentoId,
        nome: data.result.nome,
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToObterDepartamentosEmpresa(
    data: any
  ): ObterDepartamentosEmpresaResponse {
    let response: ObterDepartamentosEmpresaResponse =
      new ObterDepartamentosEmpresaResponse();

    if (data.isSuccessful) {
      response = <ObterDepartamentosEmpresaResponse>{
        departamentos: data.result.departamentos,
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  //#endregion

  //#endregion

  //#region Cargos

  criarCargo(
    empresaId: number,
    cargo: CriarCargoRequest
  ): Observable<CriarCargoResponse> {
    let url = `${this.api}/${empresaId}/cargos`;

    return this.http
      .post<CriarCargoResponse>(url, cargo)
      .pipe(map((data) => this.transformToCriarCargoResponse(data)));
  }

  obterCargos(empresaId: number): Observable<ObterCargosEmpresaResponse> {
    let url = `${this.api}/${empresaId}/cargos`;

    return this.http
      .get<ObterCargosEmpresaResponse>(url)
      .pipe(map((data) => this.transformToObterCargosEmpresa(data)));
  }

  //#region Privates

  private transformToCriarCargoResponse(data: any): CriarCargoResponse {
    let response: CriarCargoResponse = new CriarCargoResponse();

    if (data.isSuccessful) {
      response = <CriarCargoResponse>{
        cargoId: data.result.cargoId,
        nome: data.result.nome,
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  private transformToObterCargosEmpresa(data: any): ObterCargosEmpresaResponse {
    let response: ObterCargosEmpresaResponse = new ObterCargosEmpresaResponse();

    if (data.isSuccessful) {
      response = <ObterCargosEmpresaResponse>{ cargos: data.result.cargos };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });
    return response;
  }

  //#endregion

  //#endregion
}
