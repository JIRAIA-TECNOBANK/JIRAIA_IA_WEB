import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject, catchError, map, merge, of, startWith, switchMap } from 'rxjs';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { ReprocessarListaTransacoesRequest } from 'src/app/modules/sistemas/sub-modules/admin/core/requests/_portal/transacoes/reprocessar-lista-transacoes.request';
import { FiltrarTransacoesRequest } from 'src/app/modules/sistemas/sub-modules/admin/core/requests/usuarios/transacoes/filtrar-transacoes.request';
import { TransacaoService } from 'src/app/modules/sistemas/sub-modules/admin/services/_portal/transacao.service';
import { ReprocessarProtocolo } from 'src/app/modules/sistemas/sub-modules/crm/core/models/transacoes/reprocessar-protocolo.model';
import { ConciliacaoItem } from 'src/app/modules/sistemas/sub-modules/faturamento/core/models/faturamento-conciliado/conciliacao-item.model';
import { FaturamentoConciliadoItens } from 'src/app/modules/sistemas/sub-modules/faturamento/core/models/faturamento-conciliado/faturamento-conciliado-itens.model';
import { ExcluirDuplicidadeRequest } from 'src/app/modules/sistemas/sub-modules/faturamento/core/requests/faturamento-conciliado/excluir-duplicidade.request';
import { RemoverItemConciliacaoRequest } from 'src/app/modules/sistemas/sub-modules/faturamento/core/requests/faturamento-conciliado/remover-item-conciliacao.resquest';
import { ObterFaturamentoConciliadoItensResponse } from 'src/app/modules/sistemas/sub-modules/faturamento/core/responses/faturamento-conciliado/obter-faturamento-conciliado-itens.response';
import { FaturamentoConciliadoService } from 'src/app/modules/sistemas/sub-modules/faturamento/services/faturamento-conciliado.service';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { DialogInformativoComponent } from '../../../../components/dialog-informativo/dialog-informativo.component';
import { DialogExcluirDuplicidadeComponent } from '../dialog-excluir-duplicidade/dialog-excluir-duplicidade.component';
import { DialogReprocessarComponent } from '../dialog-reprocessar/dialog-reprocessar.component';

@Component({
  selector: 'app-table-detalhar-pendencias',
  templateUrl: './table-detalhar-pendencias.component.html',
  styleUrls: ['./table-detalhar-pendencias.component.scss']
})
export class TableDetalharPendenciasComponent {

  utility = Utility;
  Permissoes = Permissoes;

  pipe = new DatePipe('en-US');

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Input('conciliacaoId') conciliacaoId: number;
  @Input('empresa') empresa: string;
  @Input('uf') uf: string;
  @Input('atualizar') set atualizar(value) {
    if (this.init) {
      this.carregaGridDetalhes();
    }
  }

  init: boolean = false;
  displayedColumns: string[] = [
    'selecionar',
    'dataRegistro',
    'uf',
    'empresaNome',
    'chassi',
    'canal',
    'operacao',
    'numeroContrato',
    'status',
    'acoes'
  ];

  totalItens = 4;
  items$: Observable<ConciliacaoItem[]>;
  refresh$ = new Subject();
  conciliacaoItens: ConciliacaoItem[] = [];
  dataSource = new MatTableDataSource(this.conciliacaoItens);
  readonly isLoadingResults$ = new BehaviorSubject(true);
  sortConciliacao: string = null;

  initialSelection = [];
  allowMultiSelect = true;
  selection = new SelectionModel<ConciliacaoItem>(
    this.allowMultiSelect,
    this.initialSelection
  );

  constructor(private store: Store<{ preloader: IPreloaderState }>,
    private faturamentoConciliadoService: FaturamentoConciliadoService,
    private notifierService: NotifierService,
    private transacaoService: TransacaoService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog) { }

  ngAfterViewInit() {
    this.carregaGridDetalhes();
    this.init = true;
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }

  detalhar(dataHora: Date, chassi: string, tipoOperacao: number) {
    this.consultarRegistros(dataHora, chassi, tipoOperacao);
  }

  private consultarRegistros(dataHora: Date, chassi: string, tipoOperacao: number) {
    const filtroTransacoes: FiltrarTransacoesRequest = <FiltrarTransacoesRequest>{
      DataInicio: dataHora.toString(),
      DataFim: dataHora.toString(),
      Ativo: true,
      Chassi: chassi,
      TipoOperacao: [+tipoOperacao]
    };

    this.transacaoService.defineFiltroOperacoes(filtroTransacoes);
    this.router.navigate(['/monitor-operacoes-lotes'], { relativeTo: this.activatedRoute, queryParams: { filtroPreDefinido: true } });
  }

  desabilitarCheckboxSelecionarTodos() {
    let status = Array.from(new Set(this.dataSource.data.map(d => d.motivo)));
    return status.length > 1 || status.includes('Reprocessar');
  }

  desabilitarCheckbox(motivo: string, id: number) {
    if (motivo === 'Reprocessar') {
      if (this.selection.selected.length === 0) return false;
      return this.selection.selected[0].id !== id;
    }

    return this.selection.selected?.filter((s) => s.motivo !== motivo)?.length > 0;
  }

  onReenviar() {
    let reenvioTransacao: ReprocessarListaTransacoesRequest = <ReprocessarListaTransacoesRequest>{ protocolosTransacao: [] };
    let mensagem = '1 operação reenviada ao DETRAN com sucesso.';

    this.store.dispatch(showPreloader({ payload: '' }));
    this.selection.selected.forEach((value) => {
      reenvioTransacao.protocolosTransacao.push(<ReprocessarProtocolo>{
        protocolo: value.protocoloId,
      });
    });

    if (reenvioTransacao.protocolosTransacao.length > 1) { mensagem = `${reenvioTransacao.protocolosTransacao.length} operações reenviadas ao DETRAN com sucesso.`; }

    this.transacaoService
      .reprocessarListaTransacoes(reenvioTransacao).toPromise()
      .then(async response => {
        this.store.dispatch(closePreloader());

        if (response.message) {
          if (await this.removerItemConciliacao(this.selection.selected.map(s => s.id))) {
            this.notifierService.showNotification(mensagem, null, 'success');
            this.refresh$.next(null);
            this.selection.clear();
          }
          return;
        }

        this.notifierService.showNotification(response.errors[0].message, null, 'error');
      })
      .catch(error => {
        this.store.dispatch(closePreloader());
        this.notifierService.showNotification(error.error.errors[0].message, null, 'error');
      });
  }

  private removerItemConciliacao(ids: number[]): Promise<boolean> {
    let request = <RemoverItemConciliacaoRequest>{ ids: ids };

    return this.faturamentoConciliadoService.removerItemConciliacao(request).toPromise()
      .then(response => {
        if (response?.errors?.length) {
          this.notifierService.showNotification(response.errors[0].message, null, 'error');
          return;
        }

        return true;
      });
  }

  onExcluirCobranca() {
    let mensagem = `<p>
    <b>Essa operação foi enviada ao DETRAN mais de uma vez para um mesmo n° de contrato, chassi e
    devedor.</b><br>
     <br>
     Selecione uma das opções a seguir indicando se deseja manter a cobrança dessa operação ao cliente ou
            excluí-la do faturamento contabilizando-a como prejuízo.
     </p>`;

    const dialogRef = this.dialog.open(DialogExcluirDuplicidadeComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'info'),
      width: '700px',
      data: {
        duplicidade: true,
        mensagem: mensagem
      }
    });

    dialogRef.afterClosed().subscribe((retorno: any | boolean) => {

      if (!retorno) { return; }

      let selecionados = this.selection.selected.map(s => s.id)
      if (retorno.acao == undefined || retorno.acao === 1) {
        this.manterCobranca(selecionados, retorno.motivo);
        return;
      }

      this.contabilizarPrejuizo(selecionados, retorno.motivo);
    });
  }

  onReprocessar() {
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: DialogReprocessarComponent,
        title: 'Reprocessar',
        titleClass: 'desk',
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
        this.validarReprocessamento();
      }
    })
  }

  sortData(sort: Sort) {
    this.sortConciliacao = `${sort.active}.${sort.direction}`
    this.carregaGridDetalhes();
  }

  habilitarReenvio() {
    return this.selection.selected?.filter((r) => r.motivo === 'Reenviar').length > 0
  }

  habilitarExcluirCobranca() {
    return this.selection.selected?.filter((r) => r.motivo === 'Duplicado').length > 0
  }

  private manterCobranca(ids: number[], motivo: number) {
    let request = <ExcluirDuplicidadeRequest>{
      ids: ids,
      motivoExclusao: motivo,
      contabilizadoPrejuizo: false
    };

    this.faturamentoConciliadoService.excluirDuplicidade(request).subscribe(response => {
      if (response?.opcaoDuplicidade) {
        this.notifierService.showNotification('Cobrança do(s) contrato(s) mantida com sucesso.', null, 'success');
        this.atualizarGrid();
        return;
      }

      this.notifierService.showNotification(response.errors[0].message, null, 'error');
    });
  }

  private contabilizarPrejuizo(ids: number[], motivo: number) {
    let request = <ExcluirDuplicidadeRequest>{
      ids: ids,
      motivoExclusao: motivo,
      contabilizadoPrejuizo: true
    };

    this.faturamentoConciliadoService.excluirDuplicidade(request).subscribe(response => {
      if (response?.opcaoDuplicidade) {
        this.notifierService.showNotification('Contrato(s) excluído(s) da cobrança com sucesso.', null, 'success');
        this.atualizarGrid();
        return;
      }

      this.notifierService.showNotification(response.errors[0].message, null, 'error');
    });
  }

  private atualizarGrid() {
    this.refresh$.next(null);
    this.selection.clear();
  }

  habilitarReprocessamento() {
    return this.selection.selected?.filter((r) => r.motivo === 'Reprocessar').length > 0
  }

  private validarReprocessamento() {
    let mensagem = `<p>
    Essa alteração não poderá ser revertida. Deseja realmente reprocessar essa operação?
    </p>`;

    const dialogRef = this.dialog.open(DialogCustomComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'informativo'),
      width: '500px',
      height: '',
      data: {
        component: DialogInformativoComponent,
        title: '',
        mensagemModal: mensagem,
        buttonCancel: {
          value: false,
          text: 'Cancelar',
        },
        buttonConfirm: {
          value: true,
          text: 'Sim, reprocessar',
        },
        disableSaveWithoutData: true,
      },
      autoFocus: false
    });

    dialogRef.beforeClosed().subscribe((confirmacao: boolean) => {
      if (confirmacao) {
        this.reprocessar();
      }
    });
  }

  private reprocessar() {
    let reenvioTransacao: ReprocessarListaTransacoesRequest = <ReprocessarListaTransacoesRequest>{
      protocolosTransacao: [],
      reprocessarDetran: false
    };

    this.store.dispatch(showPreloader({ payload: '' }));
    this.selection.selected.forEach((value) => {
      reenvioTransacao.protocolosTransacao.push(<ReprocessarProtocolo>{
        protocolo: value.protocoloId,
      });
    });

    this.transacaoService.reprocessarListaTransacoes(reenvioTransacao).toPromise()
      .then(async response => {
        this.store.dispatch(closePreloader());

        if (response.message) {
          if (await this.reprocessarConciliacaoItem(this.selection.selected[0].id)) {
            this.notifierService.showNotification('Operação reprocessada com sucesso.', null, 'success');
            this.refresh$.next(null);
            this.selection.clear();
          }
          return;
        }

        this.notifierService.showNotification(response.errors[0].message, null, 'error');
      })
      .catch(error => {
        this.store.dispatch(closePreloader());
        this.notifierService.showNotification(error.error.errors[0].message, null, 'error');
      });
  }

  private async reprocessarConciliacaoItem(id: number) {
    return this.faturamentoConciliadoService.reprocessarConciliacaoItem(id).toPromise()
      .then(response => {
        if (response?.reprocessado) {
          return true;
        }

        this.notifierService.showNotification(response.errors[0].message, null, 'error');
        return false;
      })
  }

  retornarTipoOperacao(operacao: string): string {
    let tipoOperacao = +operacao;

    if (tipoOperacao === 1) {
      return 'Registro de contrato';
    }

    if (tipoOperacao === 2) {
      return 'Alteração de contrato';
    }

    if (tipoOperacao === 3) {
      return 'Registro de aditivo';
    }

    if (tipoOperacao === 4) {
      return 'Alteração de aditivo';
    }
  }

  retornarStatus(motivo: string) {
    switch (motivo) {
      case 'Reenviar': return 'Cobrança Tecnobank';
      case 'Reprocessar': return 'Cobrança DETRAN';
      case 'Duplicado': return 'Duplicidade';
    }
  }

  private carregaGridDetalhes() {
    this.selection.clear();
    
    if (this.paginator) { this.paginator.pageIndex = 0; }

    this.items$ = merge(this.refresh$, this.paginator?.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarItens(this.conciliacaoId, this.paginator?.pageIndex, this.paginator?.pageSize, this.sortConciliacao);
      }),
      map((result: { faturamentoConciliadoItens: FaturamentoConciliadoItens }) => {
        this.totalItens = result.faturamentoConciliadoItens.totalCount;
        this.dataSource = new MatTableDataSource<ConciliacaoItem>(result.faturamentoConciliadoItens.items);
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader())

        return result.faturamentoConciliadoItens.items;
      }),
      catchError((err) => {
        this.isLoadingResults$.next(false);
        console.info(err);
        this.store.dispatch(closePreloader())
        return of([]);
      })
    );
  }

  private listarItens(id: number, pageIndex: number = 0, pageSize: number = 25, sort: string = null): Observable<ObterFaturamentoConciliadoItensResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))
    return this.faturamentoConciliadoService.obterTableDetalhamentoPendencias(id, pageIndex, pageSize, sort);
  }
}
