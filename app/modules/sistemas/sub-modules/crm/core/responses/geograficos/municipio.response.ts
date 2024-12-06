import { BaseResponse } from "src/app/core/responses/base.response";
import { Municipio } from "../../models/geograficos/municipio.model";

export class MunicipioResponse extends BaseResponse {
    municipios: Municipio[] = [];
}