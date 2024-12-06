export class FiltrarTransacoesRequest {
    TipoOperacao?: number[];
    Uf?: string[];
    StatusTransacao?: number[];
    NomeStatusTransacao?: number[];
    NumeroContrato?: string;
    NumeroAditivo?: string;
    Renavam?: number;
    Chassi?: string;
    NumeroGravame?: string;
    Placa?: string;
    DocumentoDevedor?: string;
    DocumentoCredor?: string[];
    DataInicio: string | Date;
    DataFim: string | Date;
    ExisteImagem: boolean;
    CanalServico?: number[];
    Email?: string;
    PageIndex?: number;
    PageSize?: number;
    Sort?: string;
    Codigo?: string[];
    ProtocoloLote?: string;
    Ativo?: boolean;
}
