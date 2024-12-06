import { BaseResponse } from "src/app/core/responses/base.response";
import { Normativo } from "../model/normativos.model";

export class ObterListaNormativoResponse extends BaseResponse {
    totalDeRegistros: number;
    normativos: Normativo[];
}