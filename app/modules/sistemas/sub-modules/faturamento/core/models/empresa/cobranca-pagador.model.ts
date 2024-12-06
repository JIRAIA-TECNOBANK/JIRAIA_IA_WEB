import { TipoNota } from "../../enums/tipo-nota.enum";

export class CobrancaPagador {
    empresaId: number;
    credorContrato: boolean;
    cnpj?: string;
    nota?: TipoNota;
}