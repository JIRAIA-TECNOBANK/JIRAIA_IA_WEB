import { MetadadoContrato } from "../../../models/_portal/common/metadado-contrato.model";

export class RegistrarImagemRequest {
    imagemBase64: string;
    nomeArquivo: string;
    metadadoContrato: MetadadoContrato;
}