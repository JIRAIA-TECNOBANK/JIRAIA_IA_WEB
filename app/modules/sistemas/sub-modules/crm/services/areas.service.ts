import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { map } from "rxjs/operators";
import { AppSettings } from "src/app/configs/app-settings.config";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { AtivarAreasResponse } from "../../admin/core/responses/areas/ativar-areas.response";
import { AtualizarAreasResponse } from "../../admin/core/responses/areas/atualizar-areas.response";
import { DeleteAreasResponse } from "../../admin/core/responses/areas/delete-areas.response";
import { IncluirAreasResponse } from "../../admin/core/responses/areas/incluir-areas.response";
import { ObterAreasIdResponse } from "../../admin/core/responses/areas/obter-areas-id.response";
import { ObterAreasPaginationResponse } from "../../admin/core/responses/areas/obter-areas-pagination.response";
import { IAreasService } from "../../admin/services/interfaces/areas.interface.service";
import { AreasFiltro } from "../../admin/core/models/areas/areas-filtro.model";
import { Area } from "../../admin/core/models/areas/areas.model";

@Injectable()
export class AreasService implements IAreasService {
    constructor(private appSettings: AppSettings, private http: HttpClient) { }

    api: string = `${this.appSettings.baseUrlApiADM}areas`;

    obterAreasPaginado(filtro: AreasFiltro = null, sort: string = 'nome.asc', areasIds: number[] = []): Observable<ObterAreasPaginationResponse> {
        let params = new HttpParams().set('sort', sort);
        Object.keys(filtro).forEach((key) => {
            if (filtro[key] !== '' || filtro[key].length !== 0) { params = params.append(key, filtro[key]) }
        });
        if (areasIds.length > 0) { areasIds.forEach(area => params = params.append('areaId', area)); }

        return this.http.get<ObterAreasPaginationResponse>(this.api, { params: params })
            .pipe(map(data => this.transformToObterAreasPaginadoResponse(data)));
    }

    obterAreas() {
        return this.obterAreasPaginado(<AreasFiltro>{ ativo: true, pageIndex: 0, pageSize: 100 }, "nome.asc");
    }

    obterAreaId(areasIds: number[], pageIndex: number = 0, pageSize: number = 5) {
        let url = `${this.api}`;
        let params = new HttpParams()
            .set('pageIndex', pageIndex)
            .set('pageSize', pageSize)
        areasIds.forEach(area => params = params.append('areaId', area));

        return this.http.get<ObterAreasIdResponse>(url, { params: params })
            .pipe(map(data => this.transformToObterAreaIdResponse(data)))
    }

    incluirArea(area: any) {
        return this.http.post<IncluirAreasResponse>(this.api, area)
            .pipe(map(data => this.transformToIncluirAreaResponse(data)))
    }

    ativarArea(areaId: number, area: Area) {
        let url = `${this.api}/${areaId}/ativar`;
        return this.http.put<AtivarAreasResponse>(url, area)
            .pipe(map(data => this.transformToAtivarAreaResponse(data)))
    }

    atualizarArea(areaId: number, area: any) {
        let url = `${this.api}/${areaId}`;
        return this.http.put<AtualizarAreasResponse>(url, area)
            .pipe(map(data => this.transformToAtualizarAreaResponse(data)))
    }

    inativarArea(areaId: number) {
        let url = `${this.api}/${areaId}/inativar`;
        return this.http.delete<DeleteAreasResponse>(url)
            .pipe(map(data => this.transformToDeleteAreaResponse(data)))
    }

    //#region Private

    private transformToObterAreasPaginadoResponse(data: any): ObterAreasPaginationResponse {
        let response: ObterAreasPaginationResponse = new ObterAreasPaginationResponse()

        if (data.isSuccessful) {
            response.totalItems = data.result.totalItems;
            response.areas = data.result.areas;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToIncluirAreaResponse(data: any): IncluirAreasResponse {
        let response: IncluirAreasResponse = new IncluirAreasResponse()

        if (data.isSuccessful) {
            response.areas = data.result
            return response
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName)
        });
        return response
    }

    private transformToAtivarAreaResponse(data: any): AtivarAreasResponse {
        let response: AtivarAreasResponse = new AtivarAreasResponse()

        if (data.isSuccessful) {
            response.areas = data.result
            return response
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName)
        });
        return response
    }

    private transformToAtualizarAreaResponse(data: any): AtualizarAreasResponse {
        let response: AtualizarAreasResponse = new AtualizarAreasResponse()

        if (data.isSuccessful) {
            response.areas = data.result
            return response
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName)
        });
        return response
    }

    private transformToObterAreaIdResponse(data: any): ObterAreasIdResponse {
        let response: ObterAreasIdResponse = new ObterAreasIdResponse()

        if (data.isSuccessful) {
            response = data.result.areas[0]
            return response
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName)
        });
        return response
    }

    private transformToDeleteAreaResponse(data: any): DeleteAreasResponse {
        let response: DeleteAreasResponse = new DeleteAreasResponse()

        if (data.isSuccessful) {
            response = data
            return response
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName)
        });
        return response
    }

    //#endregion
}
