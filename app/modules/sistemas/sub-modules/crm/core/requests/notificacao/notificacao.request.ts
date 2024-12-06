export class NotificacaoRequest {
  tipoNotificacao: number;
  tipoFrequencia: number;
  ehNotificaTodosClientes?: boolean;
  statusNotificacaoId?: number;
  titulo: string;
  mensagem: string;
  categoriaID: number;
  urlImagem?: string;
  nomeArquivoImagem?: string;
  imagemBase64?: string;
  descricaoBotao?: string;
  urlBotao?: string;
  agendar?: boolean;
  dataAgendamento?: string;
  ativo: boolean;
  empresaId?: number;
  usuarios?: number[];
  dataInicio?: string;
  dataFim?: string;
}