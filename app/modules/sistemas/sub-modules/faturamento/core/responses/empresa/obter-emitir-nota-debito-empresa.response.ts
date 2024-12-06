import { BaseResponse } from "src/app/core/responses/base.response";

export class ObterEmitirNotaDebitoEmpresaResponse extends BaseResponse {
    empresaTaxaDetranId: number;
    empresaId: number;
    notaDebito: boolean;
    uf: string;
}