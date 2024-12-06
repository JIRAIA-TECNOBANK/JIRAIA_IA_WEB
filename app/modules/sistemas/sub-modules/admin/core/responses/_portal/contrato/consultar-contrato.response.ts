import { BaseResponse } from "src/app/core/responses/base.response";
import { MetadadoContrato } from "../../../models/_portal/common/metadado-contrato.model";
import { ContratoComplementar } from "../../../models/_portal/contratos/contrato-complementar.model";
import { Contrato } from "../../../models/_portal/contratos/contrato.model";
import { Credor } from "../../../models/_portal/contratos/credor.model";
import { Devedor } from "../../../models/_portal/contratos/devedor.model";
import { Financiamento } from "../../../models/_portal/contratos/financiamento.model";
import { Veiculo } from "../../../models/_portal/contratos/veiculo.model";

export class ConsultarContratoResponse extends BaseResponse {
    requisitoContratoId: number;
    metadadoContrato: MetadadoContrato;
    contrato: Contrato;
    complementar: ContratoComplementar;
    veiculo: Veiculo[];
    financiamento: Financiamento;
    credor: Credor;
    devedor: Devedor;
    terceiroGarantidor?: Devedor;
    dataTransacao?: Date;
}
