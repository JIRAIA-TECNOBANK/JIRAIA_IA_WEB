import { Usuario } from "../../models/usuarios/usuario.model";

export interface IAuthService {
    obterUsuarioAtual(): Promise<Usuario>;
    logout(clearToken?: boolean): void;
}