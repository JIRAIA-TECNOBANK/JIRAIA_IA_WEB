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
import { AprovacaoCestaServico } from '../../../../core/models/gestao-aprovacoes/aprovacao-cesta-servico.model';
import { FiltroAprovacaoCancelamentoNota } from '../../../../core/models/gestao-aprovacoes/filtro-aprovacao-cancelamento-nota.model';
import { TableAprovarCestaServico } from '../../../../core/models/gestao-aprovacoes/table-aprovar-cesta-servico.model';
import { ObterTableAprovacaoCestaServico } from '../../../../core/responses/aprovacao/obter-table-aprovacao-cesta-servico.response';
import { FaturamentoAprovacaoService } from '../../../../services/aprovacao.service';

@Component({
  selector: 'app-table-cesta-servico',
  templateUrl: './table-cesta-servico.component.html',
  styleUrls: ['./table-cesta-servico.component.scss']
})
export class TableCestaServicoComponent {

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
      this.carregaGridAprovacaoCesta();
    }
  }
  @Input('filtro') set setFiltro(value) {
    this.carregaGridAprovacaoCesta(value);
    this.filtro = value;
  }

  @Input('aba') set setAba(abaAprovacaoSelecionada: boolean) {
    this.abaAprovacaoCestaSelecionada = abaAprovacaoSelecionada;
  }

  init: boolean = false;
  displayedColumns: string[] = [
    'selecionar',
    'empresa',
    'clienteId',
    'uf',
    'nomeCesta',
    'inicioVigencia',
    'cadastradoPor',
    'aprovadoPor',
    'status',
    'acoes'
  ];

  totalItens = 0;
  items$: Observable<AprovacaoCestaServico[]>;
  refresh$ = new Subject();
  cestaItens: AprovacaoCestaServico[] = [];

  dataSource = new MatTableDataSource(this.cestaItens);
  readonly isLoadingResults$ = new BehaviorSubject(true);
  sortAprovacao: string = null;

  initialSelection = [];
  allowMultiSelect = true;
  selection = new SelectionModel<AprovacaoCestaServico>(
    this.allowMultiSelect,
    this.initialSelection
  );

  timer: NodeJS.Timeout;
  abaAprovacaoCestaSelecionada: boolean = false;

  constructor(private store: Store<{ preloader: IPreloaderState }>,
    private aprovacaoService: FaturamentoAprovacaoService,
    private notifierService: NotifierService) { }

  ngAfterViewInit() {
    Utility.watchCondition(
      this.timer,
      () => {
        if (!this.init && this.abaAprovacaoCestaSelecionada) {
          this.carregaGridAprovacaoCesta();
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
    if (this.selection.selected.length == 0) return false;
  }

  onAprovar(ids: number[] = null) {
    this.store.dispatch(showPreloader({ payload: '' }))

    if (ids == null) ids = this.selection.selected.map(s => s.id);

    this.aprovacaoService.aprovarCestaServico(ids).subscribe({
      next: (response) => {
        this.store.dispatch(closePreloader())

        if (response.aprovado) {
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

    this.aprovacaoService.recusarCestaServico(id).subscribe({
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
    this.carregaGridAprovacaoCesta();
  }

  private carregaGridAprovacaoCesta(filtros: FiltroAprovacaoCancelamentoNota = null) {
    this.selection.clear();

    if (this.paginator) { this.paginator.pageIndex = 0; }

    setTimeout(() => {
      this.items$ = merge(this.refresh$, this.paginator?.page).pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults$.next(true);
          return this.listarAprovacoes(this.paginator?.pageIndex, this.paginator?.pageSize, this.sortAprovacao, filtros);
        }),
        map((result: { aprovacoes: TableAprovarCestaServico }) => {
          this.totalItens = result.aprovacoes.totalCount;
          this.dataSource = new MatTableDataSource<AprovacaoCestaServico>(result.aprovacoes.items.filter(i => i.status != 'Aprovada'));
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

  private listarAprovacoes(pageIndex: number = 0, pageSize: number = 25, sort: string = null, filtros: FiltroAprovacaoCancelamentoNota = null): Observable<ObterTableAprovacaoCestaServico> {
    this.store.dispatch(showPreloader({ payload: '' }))
    return this.aprovacaoService.obterTableAprovacaoCesta(pageIndex, pageSize, sort, filtros);
  }
}
