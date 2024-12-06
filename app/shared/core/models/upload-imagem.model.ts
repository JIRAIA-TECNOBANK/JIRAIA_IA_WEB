import { TipoStatusImagem } from "../enums/tipo-status-imagem.enum";

export class UploadImagem {
    nome: string;
    type: string;
    tamanho: number;
    dataEnvio: string;
    base64: string;
    statusArquivo?: TipoStatusImagem;
    progresso?: number;
}