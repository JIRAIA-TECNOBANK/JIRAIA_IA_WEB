import { BaseResponse } from "src/app/core/responses/base.response";
import { BannersPaginado } from "../../../models/configuracoes/gestao-banners/banners-paginado.model";

export class ObterBannersPaginadoResponse extends BaseResponse {
    banners: BannersPaginado[];
    pageIndex: number;
    totalItems: number;
}