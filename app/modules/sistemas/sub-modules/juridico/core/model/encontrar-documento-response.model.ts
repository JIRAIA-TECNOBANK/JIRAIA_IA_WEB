export interface EncontrarDocumentoResponse {
    quantidade: number
    lista: ArquivoEncontrado[]
}

export interface ArquivoEncontrado {
    nome: string
    base64: string
}