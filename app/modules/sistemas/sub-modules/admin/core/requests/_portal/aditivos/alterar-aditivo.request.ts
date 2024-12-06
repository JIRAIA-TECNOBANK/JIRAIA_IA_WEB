import { MetadadoContrato } from "../../../models/_portal/common/metadado-contrato.model";
import { ContratoComplementar } from "../../../models/_portal/contratos/contrato-complementar.model";
import { Contrato } from "../../../models/_portal/contratos/contrato.model";
import { Credor } from "../../../models/_portal/contratos/credor.model";
import { Devedor } from "../../../models/_portal/contratos/devedor.model";
import { Financiamento } from "../../../models/_portal/contratos/financiamento.model";
import { Veiculo } from "../../../models/_portal/contratos/veiculo.model";

export class AlterarAditivoRequest {
  metadadoContrato: MetadadoContrato;
  contrato: Contrato;
  veiculo: Veiculo[];
  credor: Credor;
  devedor: Devedor;
  financiamento: Financiamento;
  complementar: ContratoComplementar;
  terceiroGarantidor?: any;

  constructor() {
    this.metadadoContrato = new MetadadoContrato();
    this.contrato = new Contrato();
    this.veiculo = new Array<Veiculo>();
    this.credor = new Credor();
    this.devedor = new Devedor();
    this.financiamento = new Financiamento();
    this.complementar = new ContratoComplementar();
    this.terceiroGarantidor = null;
  }
}