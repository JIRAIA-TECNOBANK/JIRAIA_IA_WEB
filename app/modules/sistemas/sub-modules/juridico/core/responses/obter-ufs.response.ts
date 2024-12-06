import { BaseResponse } from "src/app/core/responses/base.response";

export class ObterListaUfResponse extends BaseResponse {
    ufs: Uf[]
}

class Uf {
    id: number;
    uf: string;
};
