export class Contato {
    ddd: string;
    telefone: string;
    email: string;

    get telefoneCompleto(): string {
        if (this.ddd == undefined || this.telefone == undefined) {
            return '';
        }            
        return this.ddd + this.telefone;
    }
}