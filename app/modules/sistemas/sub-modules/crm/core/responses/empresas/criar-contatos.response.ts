import { BaseResponse } from 'src/app/core/responses/base.response';
import { Contatos } from '../../models/empresas/contato.model';

export class CriarContatosResponse extends BaseResponse {
  contato: Contatos;
  empresaId: number;
}
