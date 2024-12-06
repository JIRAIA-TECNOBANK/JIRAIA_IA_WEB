import { TipoDocumento } from "src/app/core/enums/tipo-documento.enum";
export class Documento {
    numero: string;
    tipoDocumento: number;

    private static maskCPF = '000.000.000-00';
    private static maskCNPJ = '00.000.000/0000-00'

    static convertToNumber(tipo: string): number {
        if (tipo == TipoDocumento.Cpf) {
            return 1
        }
        return 2;
    }

    static convertToString(tipo: number): string {
        if (tipo == 1) {
            return TipoDocumento.Cpf;
        }
        return TipoDocumento.Cnpj;
    }

    static mascaraDocumento(tipoDocumento: string): string {

        if (tipoDocumento == TipoDocumento.Cpf)
            return this.maskCPF;

        return this.maskCNPJ;
    }

    static mascaraCPF(): string {
        return this.maskCPF;
    }

    static mascaraCNPJ(): string {
        return this.maskCNPJ;
    }
}