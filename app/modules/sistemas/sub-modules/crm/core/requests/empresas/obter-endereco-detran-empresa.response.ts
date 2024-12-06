import { BaseResponse } from "src/app/core/responses/base.response";

export class ObterEnderecoDetranEmpresaResponse extends BaseResponse {
    bairro: string;
    cep: string;
    complemento: string;
    detranId: number;
    logradouro: string;
    municipio: string;
    numero: string;
    uf: string;
    municipioId: number;
    parametrizarDuda: boolean;
    enderecoEmpresaId: number;
    dataInicial: string;
    dataFinal: string;
}