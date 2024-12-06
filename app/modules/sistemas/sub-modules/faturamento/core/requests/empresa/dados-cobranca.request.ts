import { TipoNota } from "../../enums/tipo-nota.enum";

export class DadosCobrancaRequest {
    empresaId: number;
    credorContrato: boolean;
    cnpj: string;
    nota: TipoNota;
    diaVencimento?: number;
    ultimoDia: boolean;
}