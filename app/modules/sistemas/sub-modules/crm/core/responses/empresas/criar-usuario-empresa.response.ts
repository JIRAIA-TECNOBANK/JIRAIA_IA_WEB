import { BaseResponse } from 'src/app/core/responses/base.response';

export class CriarUsuarioEmpresaResponse extends BaseResponse {
  nome: string;
  usuarioGuid: string;
}
