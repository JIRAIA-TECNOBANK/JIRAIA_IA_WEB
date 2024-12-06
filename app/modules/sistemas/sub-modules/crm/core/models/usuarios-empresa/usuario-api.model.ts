export class UsuarioApi {
  id: number;
  apiKey: string;
  secret: string;
  servico: string
  dataUltimaTransacao: string;
  emailsRecebemNotificacao: Array<string>;
  ambiente: number;
  ativo: boolean;
  empresaId: number;
  criadoEm: Date;
}