import { TipoRegistroDashboard } from "../../../../../core/enums/tipo-registro-dashboard.enum";
import { ResumoRegistrosDadosDetalhe } from "./resumo-registros-dados-detalhe.model";
import { ResumoRegistrosDados } from "./resumo-registros-dados.model";

export class RegistrosResumo {
    name: string; // Contratos registrados | Contratos com inconsistências | Contratos sem imagem
    data: ResumoRegistrosDados[];
    tipo: TipoRegistroDashboard;
    porcentagem: string;
    total: number;
    detalheRegistros: ResumoRegistrosDadosDetalhe[];
}