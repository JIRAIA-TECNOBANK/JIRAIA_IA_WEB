import { BaseResponse } from "src/app/core/responses/base.response";
import { ArtigosPaginado } from "../../models/central-ajuda/artigos-paginado";

export class ObterArtigosPaginadoResponse extends BaseResponse {
    listaArtigos: ArtigosPaginado[];
    pageIndex: number;
    totalItems: number;
  }