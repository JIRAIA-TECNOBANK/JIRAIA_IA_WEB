import { BaseResponse } from "src/app/core/responses/base.response";

export class AtivarInativarDetranResponse extends BaseResponse {
    id: number;
    uf: string;
    ativo: boolean;
    data: string;
    hora: string;
    periodoInatividade: string;
    conectado: boolean;
}