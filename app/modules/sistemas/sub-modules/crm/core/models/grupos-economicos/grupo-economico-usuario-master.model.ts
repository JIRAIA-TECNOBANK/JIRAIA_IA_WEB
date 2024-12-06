export class GrupoEconomicoUsuarioMaster {
  primeiroNome: string;
  sobrenome: string;
  documento: string;
  email: string;
  ehMaster: boolean;
  telefones: string[];
  usuarioGuid?: string;
  ativaMfa?: boolean;
  notificaFaturamento?: boolean;
}