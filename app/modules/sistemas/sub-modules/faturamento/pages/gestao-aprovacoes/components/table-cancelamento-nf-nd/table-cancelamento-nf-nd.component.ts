import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Sort } from '@angular/material/sort';
import { Store } from '@ngrx/store';
import { BehaviorSubject, catchError, map, merge, Observable, of, startWith, Subject, switchMap } from 'rxjs';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { FiltroConciliacao } from '../../../../core/models/faturamento-conciliado/filtro-conciliacao.model';
import { AprovacaoNota } from '../../../../core/models/gestao-aprovacoes/aprovacao-nota.model';
import { FiltroAprovacaoCancelamentoNota } from '../../../../core/models/gestao-aprovacoes/filtro-aprovacao-cancelamento-nota.model';
import { TableAprovarCancelamentoNFND } from '../../../../core/models/gestao-aprovacoes/table-aprovar-cancelamento-nf-nd.model';
import { ObterTableCancelamentoNotasResponse } from '../../../../core/responses/aprovacao/obter-table-cancelamento-notas.response';
import { FaturamentoAprovacaoService } from '../../../../services/aprovacao.service';

@Component({
  selector: 'app-table-cancelamento-nf-nd',
  templateUrl: './table-cancelamento-nf-nd.component.html',
  styleUrls: ['./table-cancelamento-nf-nd.component.scss']
})
export class TableCancelamentoNfNdComponent {

  utility = Utility;
  Permissoes = Permissoes;

  pipe = new DatePipe('en-US');
  filtro: FiltroConciliacao;
  empresaId: number = null;
  emailUsuarios: string[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Output('atualizarGrids') atualizarGrids: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input('atualizar') set atualizar(value) {
    if (this.init) {
      this.carregaGridCancelamentoNotas();
    }
  }
  @Input('filtro') set setFiltro(value) {
    this.carregaGridCancelamentoNotas(value);
    this.filtro = value;
  }

  @Input('aba') set setAba(abaNotasSelecionada: boolean) {
    this.abaNotasSelecionada = abaNotasSelecionada;
  }

  init: boolean = false;
  displayedColumns: string[] = [
    'selecionar',
    'empresa',
    'clienteId',
    'uf',
    'mesCompetencia',
    'valorNotaFiscal',
    'valorNotaDebito',
    'descontoNF',
    'descontoND',
    'solicitadoPor',
    'documento',
    'aprovadoPor',
    'status',
    'acoes'
  ];

  totalItens = 0;
  items$: Observable<AprovacaoNota[]>;
  refresh$ = new Subject();
  cancelamentoItens: AprovacaoNota[] = [];
  dataSource = new MatTableDataSource(this.cancelamentoItens);
  readonly isLoadingResults$ = new BehaviorSubject(true);
  sortAprovacao: string = null;

  initialSelection = [];
  allowMultiSelect = true;
  selection = new SelectionModel<AprovacaoNota>(
    this.allowMultiSelect,
    this.initialSelection
  );

  timer: NodeJS.Timeout;
  abaNotasSelecionada: boolean = false;

  constructor(private store: Store<{ preloader: IPreloaderState }>,
    private aprovacaoService: FaturamentoAprovacaoService,
    private notifierService: NotifierService) { }

  ngAfterViewInit() {
    Utility.watchCondition(
      this.timer,
      () => {
        if (!this.init && this.abaNotasSelecionada) {
          this.carregaGridCancelamentoNotas();
          return true;
        }
      },
      100
    );
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }

  habilitarAprovar() {
    return this.selection.selected.length > 0;

  }

  onAprovar(ids: number[] = null) {
    this.store.dispatch(showPreloader({ payload: '' }))

    if (ids == null) ids = this.selection.selected.map(s => s.id);

    this.aprovacaoService.aprovarCancelamentoNota(ids).subscribe({
      next: (response) => {
        this.store.dispatch(closePreloader())

        if (response.cancelado) {
          let mensagem = ids.length > 1 ? 'Operações aprovadas com sucesso!' : 'Operação aprovada com sucesso!';
          this.notifierService.showNotification(mensagem, null, 'success');
          this.refresh$.next(null);
          this.selection.clear();
          return;
        }

        this.notifierService.showNotification(response.errors[0].message, null, 'error');
      },
      error: (erro) => {
        this.notifierService.showNotification('Houve um erro interno.', null, 'error');
        this.store.dispatch(closePreloader());
      }
    })
  }

  recusar(id: number) {
    this.store.dispatch(showPreloader({ payload: '' }))

    this.aprovacaoService.recusarCancelamentoNota(id).subscribe({
      next: (response) => {
        this.store.dispatch(closePreloader())

        if (response.recusado) {
          this.notifierService.showNotification('Operação recusada com sucesso!', null, 'success');
          this.refresh$.next(null);
          this.selection.clear();
          return;
        }

        this.notifierService.showNotification(response.errors[0].message, null, 'error');
      },
      error: (erro) => {
        this.notifierService.showNotification('Houve um erro interno.', null, 'error');
        this.store.dispatch(closePreloader());
      }
    });
  }

  sortData(sort: Sort) {
    this.sortAprovacao = `${sort.active}.${sort.direction}`
    this.carregaGridCancelamentoNotas();
  }

  private carregaGridCancelamentoNotas(filtros: FiltroAprovacaoCancelamentoNota = null) {
    this.selection.clear();

    if (this.paginator) { this.paginator.pageIndex = 0; }

    setTimeout(() => {
      this.items$ = merge(this.refresh$, this.paginator?.page).pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults$.next(true);
          return this.listarAprovacoes(this.paginator?.pageIndex, this.paginator?.pageSize, this.sortAprovacao, filtros);
        }),
        map((result: { aprovacoes: TableAprovarCancelamentoNFND }) => {
          this.totalItens = result.aprovacoes.totalCount;
          this.dataSource = new MatTableDataSource<AprovacaoNota>(result.aprovacoes.items.filter(i => i.status != 'Aprovada'));
          this.isLoadingResults$.next(false);
          this.store.dispatch(closePreloader())

          return result.aprovacoes.items;
        }),
        catchError((err) => {
          this.isLoadingResults$.next(false);
          console.info(err);
          this.totalItens = 0;
          this.store.dispatch(closePreloader())
          return of([]);
        })
      );
    }, 0)
    this.init = true;
  }

  private listarAprovacoes(pageIndex: number = 0, pageSize: number = 25, sort: string = null, filtros: FiltroAprovacaoCancelamentoNota = null): Observable<ObterTableCancelamentoNotasResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))
    return this.aprovacaoService.obterTableCancelamentoNotas(pageIndex, pageSize, sort, filtros);
  }
}
