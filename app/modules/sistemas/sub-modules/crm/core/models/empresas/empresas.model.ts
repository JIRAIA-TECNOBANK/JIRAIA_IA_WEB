export class Empresas {
    id: number;
    nomeFantasia: string;
    cnpj: string;
    razaoSocial: string;
    inscricaoEstadual: string;
    inscricaoMunicipal: string;
    tipoEmpresaId: number;
    comercialResponsavelId: number;
    ativo: boolean;
    grupoEconomicoId: number;
    email: string;
    telefone: string;
    cadastroOriginadoContran?: boolean;
}