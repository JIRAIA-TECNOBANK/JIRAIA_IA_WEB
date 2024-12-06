export class CriarConfigImagemRequest {
  dominioId: number;
  tamanhoArquivoTbk: number;
  tamanhoArquivoDetran: number;
  envioDetran: boolean;
  converteExtensao: boolean;
  converteTamanho: boolean;
  tipoArquivoDetran: Array<string>;
  tipoArquivoTbk: Array<string>;
}
