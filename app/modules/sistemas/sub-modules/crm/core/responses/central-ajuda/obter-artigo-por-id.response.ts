import { BaseResponse } from "src/app/core/responses/base.response";
import { ArtigoDocumento } from "../../models/central-ajuda/artigo-documento";
import { StatusArtigo } from "../../enums/tipo-status-artigo.enum";

export class ObterArtigoPorIdResponse extends BaseResponse {
  id: number;
  conteudoComplementar: string;
  listaArquivos: ArtigoDocumento[];
  posicao: number;
  secaoId: number;
  statusArtigo: StatusArtigo;
  titulo: string;
  urlVideo: string;
}