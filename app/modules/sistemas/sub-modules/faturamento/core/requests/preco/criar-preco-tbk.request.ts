import { TipoVigenciaPrecoPrivado } from "../../enums/tipo-vigencia-preco-privado.enum";
import { TaxaDetranOperacao } from "../../models/taxa/taxa-detran-operacao.model";

export class CriarPrecoTbkRequest {
    uf: string;
    criadoPor: string;
    dataInicioVigencia: Date;
    dataTerminoVigencia: Date;
    tipoPreco: number;
    nome?: string;
    renovacaoAutomatica: boolean;
    operacoes: TaxaDetranOperacao[];
    idMapaDetran: number;
    opcaoVigencia?: TipoVigenciaPrecoPrivado;
}