export class CriarBannerRequest {
    id?: number;
    tipoBanner: number;
    titulo: string;
    urlImagem?: string;
    tipoFrequencia?: number;
    nomeArquivoImagem?: string;
    imagemBase64?: string;
    urlLinkDirecionamento?: string;
    agendar?: boolean;
    dataInicio?: string;
    dataFim?: string;
}