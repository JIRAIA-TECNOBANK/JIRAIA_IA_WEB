import { BaseResponse } from "src/app/core/responses/base.response";

export class ObterListaTipoNormativoResponse extends BaseResponse {
    tiposNormativo: TipoNormativo[]
}

class TipoNormativo {
    id: number;
    descricao: string;
    nome: string;
    criadoEm: string;
};
