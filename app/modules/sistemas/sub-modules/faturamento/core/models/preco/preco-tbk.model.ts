import { TipoVigenciaPrecoPrivado } from "../../enums/tipo-vigencia-preco-privado.enum";
import { TaxaDetranOperacao } from "../taxa/taxa-detran-operacao.model";

export class PrecoTbk {
    uf: string;
    dataInicioVigencia: Date;
    dataTerminoVigencia: Date;
    tipoPreco: number;
    status: string;
    criadoPor: string;
    renovacaoAutomatica: boolean;
    operacoes: TaxaDetranOperacao[];
    id: number;
    criadoEm: Date;
    modificadoEm: Date;
    ativo: boolean;
    nome?: string;
    opcaoVigencia?: TipoVigenciaPrecoPrivado;
    permiteExclusao?: boolean;
    aprovado?: boolean;
}