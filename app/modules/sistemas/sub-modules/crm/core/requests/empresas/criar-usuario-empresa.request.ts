export class CriarUsuarioEmpresaRequest {
  primeiroNome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  ramal: string;
  ativo: boolean;
  recebeComunicados: boolean;
  documento: string;
  ehMaster: boolean;
  perfilId: number;
  departamentoId: number;
  cargoId: number;
  empresaId?: number;
  receberNotificacao?: boolean;
}
