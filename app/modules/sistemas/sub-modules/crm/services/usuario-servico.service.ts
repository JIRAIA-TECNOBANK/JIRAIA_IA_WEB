import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { AppSettings } from "src/app/configs/app-settings.config";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { UsuarioServico } from "../core/models/usuario-servico/usuario-servico.model";
import { AtivarInativarUsuarioSrdResponse } from "../core/responses/usuario-servico/ativar-inativar-usuario-srd.response";
import { IncluirUsuarioSrdResponse } from "../core/responses/usuario-servico/incluir-usuario-srd.response";
import { ObterUsuariosSrdResponse } from "../core/responses/usuario-servico/obter-usuarios-srd.response";
import { IUsuarioServicoService } from "./interfaces/usuario-servico.service";

@Injectable()
export class UsuarioServicoService implements IUsuarioServicoService {

    constructor(private appSettings: AppSettings, private http: HttpClient) { }

    api: string = `${this.appSettings.baseUrlApiCRM}usuario-servico`;
    srdApi: string = '/registro-direto';
    sisApi: string = '/send';

    //#region SRD
    obterUsuariosServicoSrdPaginado(empresaId: number, pageIndex: number = 0, pageSize: number = 25) {
        let url = `${this.api}${this.srdApi}`;

        const params = new HttpParams()
            .set('empresaId', empresaId)
            .set('pageIndex', pageIndex)
            .set('pageSize', pageSize);

        return this.http.get(url, { params: params })
            .pipe(map((data) => this.transformToObterUsuariosServicosSrdResponse(data)));
    }

    incluirUsuarioServicoSrd(usuario: UsuarioServico) {
        let url = `${this.api}${this.srdApi}`;

        return this.http.post(url, usuario)
            .pipe(map((data) => this.transformToIncluirUsuarioServicoSrdResponse(data)));
    }

    ativarInativarUsuarioServico(usuarioId: number) {
        let url = `${this.api}${this.srdApi}/ativar-inativar/${usuarioId}`;

        return this.http.put(url, null)
            .pipe(map((data) => this.transformToAtivarInativarUsuarioResponse(data)));
    }

    //#region Privates

    private transformToObterUsuariosServicosSrdResponse(data: any) {
        var response: ObterUsuariosSrdResponse = new ObterUsuariosSrdResponse();

        if (data.isSuccessful) {
            response.usuariosServico = data.result.usuariosServico;
            response.totalItems = data.result.totalItems;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) })
        return response;
    }

    private transformToIncluirUsuarioServicoSrdResponse(data: any) {
        var response: IncluirUsuarioSrdResponse = new IncluirUsuarioSrdResponse();

        if (data.isSuccessful) {
            response.id = data.result.id;
            response.ativo = data.result.ativo;
            response.criadoEm = data.result.criadoEm;
            response.criadoPor = data.result.criadoPor;
            response.email = data.result.email;
            response.emailsRecebemNotificacao = data.result.emailsRecebemNotificacao;
            response.empresaId = data.result.empresaId;
            response.modificadoEm = data.result.modificadoEm;
            response.nome = data.result.nome;
            response.password = data.result.password;
            response.servico = data.result.servico;
            response.sobrenome = data.result.sobrenome;
            response.username = data.result.username;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) })
        return response;
    }

    private transformToAtivarInativarUsuarioResponse(data: any) {
        var response: AtivarInativarUsuarioSrdResponse = new AtivarInativarUsuarioSrdResponse();

        if (data.isSuccessful) {
            response.id = data.result.id;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) })
        return response;
    }
    //#endregion

    //#endregion
}