import { Contato } from "../common/contato.model";
import { Documento } from "../common/documento.model";
import { Endereco } from "../common/endereco.model";

export class AgenteFinanceiro {
    id: number;
    codigoAgenteFinanceiro: string;
    nomeAgenteFinanceiro: string;
    documento: Documento;
    endereco: Endereco;
    contato: Contato;

    constructor() {
        this.documento = new Documento();
        this.endereco = new Endereco();
        this.contato = new Contato();
    }
}