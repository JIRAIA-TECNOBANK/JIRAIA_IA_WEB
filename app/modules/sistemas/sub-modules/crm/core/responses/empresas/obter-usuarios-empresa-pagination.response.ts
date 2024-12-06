import { BaseResponse } from 'src/app/core/responses/base.response';
import { UsuariosEmpresa } from '../../models/empresas/usuarios-empresa.model';

export class ObterUsuariosEmpresaPaginationResponse extends BaseResponse {
  pageIndex: number;
  totalItems: number;
  usuarios: UsuariosEmpresa[];
}
