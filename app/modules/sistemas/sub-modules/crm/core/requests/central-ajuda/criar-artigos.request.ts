import { StatusArtigo } from "../../enums/tipo-status-artigo.enum";
import { ArtigoDocumento } from "../../models/central-ajuda/artigo-documento";

export class CriarArtigoRequest {
    secaoId: number;
    titulo: string;
    conteudoComplementar: string;
    urlVideo?: string;
    listaArquivos?: ArtigoDocumento[];
    statusArtigo?: StatusArtigo;
    posicao?: number;
}