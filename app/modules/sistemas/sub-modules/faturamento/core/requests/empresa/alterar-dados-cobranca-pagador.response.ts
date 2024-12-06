import { TipoNota } from "../../enums/tipo-nota.enum";

export class AlterarDadosCobrancaPagadorRequest {
    empresaId: number;
    credorContrato: boolean;
    cnpj?: string;
    nota?: TipoNota;
}