export class Desconto {
	id: number;
	mesReferencia: Date;
	valorDescontoNf: number;
	valorDescontoNd: number;
	areaResponsavel: string;
	email: string;
	motivoNf: string;
	motivoNd: string;
	comentarioNf: string;
	comentarioNd: string;
	criadoEm: Date;
	modificadoEm: Date;
	ativo: boolean;
	faturamentoConciliadoId: number;
	version: number;
}
