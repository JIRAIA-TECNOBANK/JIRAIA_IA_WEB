export class Notificacao {
  id: number;
  tipoNotificacao: number;
  tipoFrequencia: number;
  ehNotificaTodosClientes: boolean;
  statusNotificacaoId: number;
  titulo: string;
  mensagem: string;
  categoriaID: number;
  urlImagem: string;
  nomeArquivoImagem: string;
  descricaoBotao: string;
  urlBotao: string;
  agendar: boolean;
  dataAgendamento: string;
  ativo: boolean;
  criadoPorNome: string;
  criadoPorEmail: string;
  empresa: number;
  usuarios: number[];
  usuarioGuid: string;
}