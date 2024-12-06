import { BaseResponse } from "src/app/core/responses/base.response";
import { GestaoDetransPaginado } from "../../models/gestao-detrans-paginado.model";

export class ObterDetransPaginadoResponse extends BaseResponse {
    tempoInatividadeDetran: GestaoDetransPaginado[];
    pageIndex: number;
    totalItems: number;
}