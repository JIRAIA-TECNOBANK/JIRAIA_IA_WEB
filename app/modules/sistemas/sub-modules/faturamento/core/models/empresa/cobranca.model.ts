import { TipoNota } from "../../enums/tipo-nota.enum";

export class Cobranca {
    id: number;
    empresaId: number;
    credorContrato: boolean;
    cnpj?: string;
    nota?: TipoNota;
    diaVencimento?: number;
    ultimoDia?: boolean;
    criadoEm: Date;
    modificadoEm: Date;
}