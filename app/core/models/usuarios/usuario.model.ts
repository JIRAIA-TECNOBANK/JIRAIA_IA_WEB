import { NomeUsuario } from "./nome-usuario.model";

export class Usuario {
    id?: string;
    email?: string;
    nome?: NomeUsuario;
    ativo?: boolean;

    constructor(id: string, nome: string, sobrenome: string, email: string) {
        this.id = id;
        this.email = email;
        this.nome = new NomeUsuario(nome, sobrenome);
    }
}