export class NomeUsuario {
    nome: string;
    sobrenome: string;

    constructor(nome: string, sobrenome: string) {
        this.nome = nome;
        this.sobrenome = sobrenome;
    }

    get nomeCompleto(): string {
        let delimitador = this.sobrenome.split(' ');
        return this.nome + ' ' + delimitador.slice(-1)[0];
    }
}