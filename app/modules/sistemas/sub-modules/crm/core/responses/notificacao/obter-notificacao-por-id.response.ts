import { BaseResponse } from "src/app/core/responses/base.response";
import { Empresas } from "../../models/empresas/empresas.model";
import { UsuariosEmpresa } from "../../models/empresas/usuarios-empresa.model";

export class ObterNotificacaoPorIdResponse extends BaseResponse {
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
  empresa: Empresas;
  usuarios: UsuariosEmpresa[];
  usuarioGuid: string;
  dataInicio: string;
  dataFim: string;
}