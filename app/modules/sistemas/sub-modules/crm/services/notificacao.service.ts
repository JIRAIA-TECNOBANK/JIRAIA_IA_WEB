import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { AppSettings } from "src/app/configs/app-settings.config";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { CriarNotificacaoResponse } from "../core/responses/notificacao/criar-notificacao.response";
import { INotificacaoService } from "../../admin/services/interfaces/notificacao.service";
import { LiberarInformacoesTela } from "src/app/core/enums/liberar-informacoes-tela.enum";
import { LiberarInformacoesResponse } from "../core/responses/notificacao/liberar-informacoes.response";
import { Observable } from "rxjs";

@Injectable()
export class NotificacaoService implements INotificacaoService {
    constructor(private appSettings: AppSettings, private http: HttpClient) { }

    api: string = `${this.appSettings.baseUrlApiADM}notificacoes`;

    liberarAcessoDadosDevedor(protocoloContrato: string, solicitanteId: number, descricao: string, produtoId: number) {
        let url = `${this.api}/devedor`;

        const params = new HttpParams()
            .set('ProtocoloContrato', protocoloContrato)
            .set('SolicitanteId', solicitanteId)
            .set('descricao', descricao)
            .set('ProdutoId', produtoId)

        return this.http.post(url, null, { params: params })
            .pipe(map(data => this.transformToLiberarAcesso(data)));
    }

    liberarInformacoes(usuarioConsultado: string, nomeTela: LiberarInformacoesTela, solicitante: string, valorSolicitante: string): Observable<LiberarInformacoesResponse> {
        let url = `${this.api}/liberar-informacoes`;

        const params = new HttpParams()
            .set('usuarioConsultado', usuarioConsultado)
            .set('nomeTela', nomeTela)
            .set('solicitante', solicitante)
            .set('valorSolicitante', valorSolicitante);

        return this.http.post<LiberarInformacoesResponse>(url, null, { params: params })
            .pipe(map(data => this.transformToLiberarInformacoesResponse(data)));
    }

    //#region Privates

    private transformToLiberarAcesso(data: any) {
        let response: CriarNotificacaoResponse = new CriarNotificacaoResponse()

        if (data.isSuccessful) {
            response = data.result;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToLiberarInformacoesResponse(data: any): LiberarInformacoesResponse {
        let response: LiberarInformacoesResponse = new LiberarInformacoesResponse()

        if (data.isSuccessful) {
            response = data.result;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    //#endregion
}