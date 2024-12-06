import { BaseResponse } from "src/app/core/responses/base.response";

export class VincularEmpresaResponse extends BaseResponse {
    grupoEconomicoId: number;
    nome: string;
    empresa: EmpresaGrupoEconomico;
}

export class EmpresaGrupoEconomico {
    id: number;
    razaoSocial: string;
}