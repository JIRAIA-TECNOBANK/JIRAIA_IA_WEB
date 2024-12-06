import { TaxaDetranOperacao } from "../../models/taxa/taxa-detran-operacao.model";

export class CriarCestaServicoRequest {
    uf: string;
    criadoPor: string;
    dataInicioVigencia: Date;
    dataTerminoVigencia: Date;
    nome: string;
    renovacaoAutomatica: boolean;
    operacoes: TaxaDetranOperacao[];
}