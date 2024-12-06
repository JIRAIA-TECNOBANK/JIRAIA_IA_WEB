import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { BreadcrumbService } from 'src/app/shared/services/breadcrumb.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { Desconto } from '../../../../core/models/faturamento-conciliado/desconto.model';
import { AplicarDescontoRequest } from '../../../../core/requests/faturamento-conciliado/aplicar-desconto.request';
import { FaturamentoConciliadoService } from '../../../../services/faturamento-conciliado.service';
import { DialogInformativoComponent } from '../../components/dialog-informativo/dialog-informativo.component';

@Component({
	selector: 'app-aplicar-desconto',
	templateUrl: './aplicar-desconto.component.html',
	styleUrls: ['./aplicar-desconto.component.scss']
})
export class AplicarDescontoComponent implements OnInit {

	utility = Utility;

	meses = [
		"Janeiro",
		"Fevereiro",
		"Março",
		"Abril",
		"Maio",
		"Junho",
		"Julho",
		"Agosto",
		"Setembro",
		"Outubro",
		"Novembro",
		"Dezembro"
	];

	readonly separatorKeysCodes = [ENTER, COMMA] as const;
	emails: string[] = [];
	mensagemErroEmail: boolean = false;
	empresaNome: string = '';
	valorMaximoNF: number = 0;
	valorMaximoND: number = 0;
	faturamentoConciliadoId: number = null;
	descontoId?: number = null;
	somenteConsulta: boolean = false;
	desconto: Desconto;

	formulario = this.fb.group({
		mes: [{ value: null }, Validators.required],
		ano: [{ value: null }, Validators.required],
		valorNF: [null, Validators.max(this.valorMaximoNF)],
		valorND: [null],
		areaResponsavel: [null, Validators.required],
		listaEmails: [[], Validators.required],
		motivoNF: [null],
		motivoND: [null],
		notaRodapeNF: [null],
		notaRodapeND: [null]
	});

	constructor(private breadcrumbService: BreadcrumbService,
		private fb: UntypedFormBuilder,
		private faturamentoConciliadoService: FaturamentoConciliadoService,
		private router: Router,
		public dialog: MatDialog,
		private notifierService: NotifierService,
		private activatedRoute: ActivatedRoute,
		private store: Store<{ preloader: IPreloaderState }>) {
		this.faturamentoConciliadoId = this.activatedRoute.snapshot.params['faturarId'];
	}

	ngOnInit(): void {
		if (!this.faturamentoConciliadoService.aplicarDescontoDados$.source['source']['_value']) {
			this.router.navigate([`/monitor-faturamento`]);
		}

		this.faturamentoConciliadoService.aplicarDescontoDados$.subscribe(dados => {
			let data = new Date()
			this.empresaNome = dados.empresaNome;
			let mes = data.getMonth();
			let ano = data.getFullYear();

			this.formulario.get('mes')?.patchValue(mes);
			this.formulario.get('ano')?.patchValue(ano);
			this.valorMaximoNF = dados.valorNF - 0.01;
			this.valorMaximoND = dados.valorND - 0.01;

			Utility.changeFieldValidators(this.formulario, 'valorNF', [Validators.max(this.valorMaximoNF)]);
			Utility.changeFieldValidators(this.formulario, 'valorND', [Validators.max(this.valorMaximoND)]);

			if (dados.consulta) {
				this.somenteConsulta = dados.consulta;
				this.desabilitarCampos(['mes', 'ano', 'valorNF', 'valorND', 'areaResponsavel', 'listaEmails', 'motivoNF', 'motivoND', 'notaRodapeNF', 'notaRodapeND']);
			}

			if (dados.descontoId) {
				this.carregarDesconto(dados.descontoId);
			}
		}).unsubscribe();
	}

	ngAfterViewInit() {
		if (!this.faturamentoConciliadoService.aplicarDescontoDados$.source['source']['_value']) return;

		setTimeout(() => {
			this.breadcrumbService.carregarPaginaTitulo(`Desconto ${this.empresaNome}`);
		}, 0);
	}


	private desabilitarCampos(fieldNames: string[]): void {
		fieldNames.forEach(field => this.formulario.get(field)?.disable());
	}

	add(event: MatChipInputEvent): void {
		const value = (event.value || '').trim();

		if (value) {
			let emailValido = this.validarEmail(value);
			this.mensagemErroEmail = !emailValido;

			if (emailValido) {
				this.emails.push(value);
				this.atribuirValorListaEmails();
			}
		}

		event.chipInput.clear();
	}

	remove(email: string): void {
		const index = this.emails.indexOf(email);
		if (index >= 0) { this.emails.splice(index, 1); }
		this.atribuirValorListaEmails();
	}

	confirmarDesconto() {
		let mensagem = `<div class="info-warning mr-2 w-100 d-flex mt-1" fxLayout="row" fxLayoutGap="15px"><i
		class="fa-regular fa-memo-circle-info"></i>
		<section class="ml-1">
						<ul class="pl-2 my-0">
								<li>
										<p class="bold my-0">Essa ação é irreversível. A nota fiscal NÃO pode ser cancelada.</p>
								</li>
						</ul>
					</section>
				</div>
				<p>Confirma a aplicação do desconto?</p>`;

		const dialogRef = this.dialog.open(DialogCustomComponent, {
			id: Utility.getElementId(TipoElemento.dlg, 'informativo'),
			width: '500px',
			data: {
				component: DialogInformativoComponent,
				mensagemModal: mensagem,
				buttonCancel: {
					value: false,
					text: 'Cancelar',
				},
				buttonConfirm: {
					value: true,
					text: 'Confirmar',
				},
			}
		});

		dialogRef.beforeClosed().subscribe((confirmacao: boolean) => {
			if (confirmacao) {
				this.aplicarDesconto();
			}
		});
	}

	voltar() {
		this.router.navigate(['/monitor-faturamento'], { relativeTo: this.activatedRoute, queryParams: { tab: 'faturar' } });
	}

	habilitarConfirmar(): boolean {
		return this.formulario?.valid && (this.formulario?.get('valorNF').value || this.formulario?.get('valorND').value);
	}

	private carregarDesconto(descontoId: number) {
		this.store.dispatch(showPreloader({ payload: '' }));
		this.descontoId = descontoId;
		this.faturamentoConciliadoService.obterDescontoCadastrado(this.faturamentoConciliadoId).subscribe((response) => {
			this.desconto = response.desconto;

			let emailsAux = this.desconto.email.split(',');

			emailsAux.forEach(email => {
				this.emails.push(email);
			});
			this.atribuirValorListaEmails();

			this.formulario.patchValue({
				valorNF: this.desconto.valorDescontoNf == 0 ? null : this.desconto.valorDescontoNf,
				valorND: this.desconto.valorDescontoNd == 0 ? null : this.desconto.valorDescontoNd,
				areaResponsavel: this.desconto.areaResponsavel,
				listaEmails: this.desconto.email,
				motivoNF: this.desconto.motivoNf,
				motivoND: this.desconto.motivoNd,
				notaRodapeNF: this.desconto.comentarioNf,
				notaRodapeND: this.desconto.comentarioNd
			})
		});
	}

	private atribuirValorListaEmails() {
		let listaEmailsString = this.emails.map(e => e).join(',');
		this.formulario.get('listaEmails').patchValue(listaEmailsString);
		this.store.dispatch(closePreloader());
	}

	private aplicarDesconto() {
		let request = <AplicarDescontoRequest>{
			faturamentoConciliadoId: +this.faturamentoConciliadoId,
			mesReferencia: new Date(this.formulario.get('ano').value, this.formulario.get('mes').value, 1),
			valorDescontoNf: this.formulario.get('valorNF').value,
			valorDescontoNd: this.formulario.get('valorND').value,
			areaResponsavel: this.formulario.get('areaResponsavel').value,
			email: this.formulario.get('listaEmails').value,
			motivoNf: this.formulario.get('motivoNF').value,
			motivoNd: this.formulario.get('motivoND').value,
			comentarioNf: this.formulario.get('notaRodapeNF').value,
			comentarioNd: this.formulario.get('notaRodapeND').value
		};

		this.store.dispatch(showPreloader({ payload: '' }));
		if (this.descontoId) {
			this.faturamentoConciliadoService.editarDesconto(request).subscribe((response) => {
				if (response.isSuccessful) {
					this.notifierService.showNotification('Desconto editado com sucesso.', null, 'success');
					this.store.dispatch(closePreloader());
					this.voltar();
					return;
				}
				this.notifierService.showNotification('Houve um erro ao tentar enviar por e-mail.', null, 'error');
			});
			this.store.dispatch(closePreloader());
			return;
		}

		this.faturamentoConciliadoService.aplicarDesconto(request).subscribe(response => {
			this.store.dispatch(closePreloader());
			if (response.descontoId) {
				this.notifierService.showNotification('Desconto aplicado com sucesso.', null, 'success');
				this.voltar();
				return;
			}

			this.notifierService.showNotification('Houve um erro ao tentar enviar por e-mail.', null, 'error');
		});
	}

	private validarEmail(email?: string): boolean {
		if (!email) {
			return false;
		}

		const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

		return emailPattern.test(email) && email.split('@')[1]?.toLowerCase() === 'tecnobank.com.br';
	}
}
