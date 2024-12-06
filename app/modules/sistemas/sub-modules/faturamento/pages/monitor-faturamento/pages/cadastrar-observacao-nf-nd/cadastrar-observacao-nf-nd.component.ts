import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Utility } from 'src/app/core/common/utility';
import { DialogAlertaConteudoComponent } from 'src/app/shared/components/dialog-alerta-conteudo/dialog-alerta-conteudo.component';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { BreadcrumbService } from 'src/app/shared/services/breadcrumb.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { AtualizarObservacaoNotasRequest } from '../../../../core/requests/faturamento-conciliado/atualizar-observacao-notas.request';
import { FaturamentoConciliadoService } from '../../../../services/faturamento-conciliado.service';

@Component({
  selector: 'app-cadastrar-observacao-nf-nd',
  templateUrl: './cadastrar-observacao-nf-nd.component.html',
  styleUrls: ['./cadastrar-observacao-nf-nd.component.scss']
})
export class CadastrarObservacaoNfNdComponent {

  utility = Utility;

  empresaNome: string = '';
  faturamentoConciliadoId: number = null;
  somenteConsulta: boolean = false;
  mostrarExcluir: boolean = false;

  formulario = this.fb.group({
    notaFiscal: [null],
    notaDebito: [null]
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
      this.empresaNome = dados.empresaNome;

      if (dados.consulta) {
        this.somenteConsulta = dados.consulta;
        Utility.modoConsulta(this.formulario);
      }

      this.carregarObservacoes();

    }).unsubscribe();
  }

  ngAfterViewInit() {
    if (!this.faturamentoConciliadoService.aplicarDescontoDados$.source['source']['_value']) return;

    Utility.waitFor(() => {
      this.breadcrumbService.carregarPaginaTitulo(`Obs NF/ND - ${this.empresaNome}`);
    }, 0)
  }

  carregarObservacoes() {
    this.faturamentoConciliadoService.obterObservacoesNotas(this.faturamentoConciliadoId).subscribe(response => {
      if (response.errors?.length > 0) {
        this.notifierService.showNotification(response.errors[0].message, null, 'error');
        return;
      }

      this.formulario.patchValue({
        notaFiscal: response.observacaoNF,
        notaDebito: response.observacaoND
      });

      if (this.formularioComValor()) { this.mostrarExcluir = true; }
      else { this.mostrarExcluir = false; }
    });
  }

  voltar() {
    if (this.somenteConsulta) {
      this.router.navigate(['/monitor-faturamento'], { relativeTo: this.activatedRoute, queryParams: { tab: 'faturado' } });
      return;
    }

    this.router.navigate(['/monitor-faturamento'], { relativeTo: this.activatedRoute, queryParams: { tab: 'faturar' } });
  }

  confirmarObservacao() {
    if (this.formularioComValor()) {
      this.atualizarObservacoes();
      return;
    }

    this.notifierService.showNotification('Preencha pelo menos um dos campos.', null, 'error');
  }

  clickExcluir() {
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '350px',
      data: {
        component: DialogAlertaConteudoComponent,
        conteudo: `<span>Ao confirmar, a(s) observação(ões) será(ão) excluída(s) da Nota Fiscal/Nota de Débito.</span>`,
        titleClass: 'd-none',
        buttonCancel: {
          value: false,
          text: 'Cancelar',
        },
        buttonConfirm: {
          value: true,
          text: 'Confirmar',
        }
      },
    });

    dialogRef.afterClosed().subscribe(confirmacao => {
      if (confirmacao) {
        this.store.dispatch(showPreloader({ payload: '' }));
        this.excluir();
        return;
      }
    })
  }

  private formularioComValor(): boolean {
    return this.formulario.get('notaFiscal').value || this.formulario.get('notaDebito').value;
  }

  private atualizarObservacoes() {
    let request: AtualizarObservacaoNotasRequest = <AtualizarObservacaoNotasRequest>{
      idConciliacao: +this.faturamentoConciliadoId,
      novaObservacaoNF: this.formulario.get('notaFiscal').value,
      novaObservacaoND: this.formulario.get('notaDebito').value
    };

    this.store.dispatch(showPreloader({ payload: '' }));

    this.faturamentoConciliadoService.atualizarObservacaoNotas(request).subscribe(response => {
      this.notifierService.showNotification(response.mensagem, null, response.flag ? 'success' : 'error');
      this.store.dispatch(closePreloader());
      this.voltar();
    }, e => {
      this.notifierService.showNotification(e.error.errors[0].message, null, 'error');
      this.store.dispatch(closePreloader());
    })
  }

  private excluir() {
    this.faturamentoConciliadoService.excluirObservacaoNotas(this.faturamentoConciliadoId).subscribe(response => {
      this.notifierService.showNotification(response.mensagem, null, response.flag ? 'success' : 'error');
      this.store.dispatch(closePreloader());
      this.voltar();
    }, e => {
      this.notifierService.showNotification(e.error.errors[0].message, null, 'error');
      this.store.dispatch(closePreloader());
    });
  }
}
