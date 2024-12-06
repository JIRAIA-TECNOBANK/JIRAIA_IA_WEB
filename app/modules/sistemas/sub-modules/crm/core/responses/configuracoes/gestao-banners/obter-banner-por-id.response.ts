import { BaseResponse } from "src/app/core/responses/base.response";

export class ObterBannerPorIdResponse extends BaseResponse {
    id: number;
    titulo: string;
    tipoBanner: number;
    statusBannerPortalId?: number;
    agendar: boolean;
    dataInicio?: string;
    dataFim?: string;
    nomeArquivoImagem?: string;
    tipoFrequencia: number;
    imagemBase64?: string;
    urlImagem?: string;
    urlLinkDirecionamento?: string;
}