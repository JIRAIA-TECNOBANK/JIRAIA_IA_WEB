import { Documento } from "src/app/modules/sistemas/core/models/documento.model";
import { Endereco } from "src/app/modules/sistemas/sub-modules/crm/core/models/geograficos/endereco.model";
import { Contato } from "../common/contato.model";

export class Credor {
  empresaId?: number;
  agenteFinanceiro: number;
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
