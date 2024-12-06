import { Municipio } from "./municipio.model";

export class Endereco {
    logradouro: string;
    numero: string;
    bairro: string;
    cep: string;
    localidade: string;
    uf: string;
    complemento: string;
    codigoMunicipio: number;
    municipio: string;
    municipioResponse?: Municipio;

    constructor() {
        this.municipioResponse = new Municipio();
    }
}