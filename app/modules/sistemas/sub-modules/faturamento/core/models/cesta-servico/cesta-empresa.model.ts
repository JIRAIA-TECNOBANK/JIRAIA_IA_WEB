import { TipoVigenciaPrecoPrivado } from "../../enums/tipo-vigencia-preco-privado.enum";

export class EmpresaPrecoTbk {
    precoTecnobankId: number;
    notaDebito: boolean;
    uf: string;
    empresaId: number;
    criadoPor: string;
    criadoEm?: Date;
    modificadoEm?: Date;
    ativo?: boolean;
    id?: number;
    dataInicioVigencia: Date;
    dataTerminoVigencia: Date;
    status: string;
    opcaoVigencia?: TipoVigenciaPrecoPrivado;
    aprovado?: boolean;
}