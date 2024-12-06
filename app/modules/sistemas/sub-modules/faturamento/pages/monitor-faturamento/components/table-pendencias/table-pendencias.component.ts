import { DatePipe } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject, catchError, map, merge, of, startWith, switchMap } from 'rxjs';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { FaturamentoConciliado } from '../../../../core/models/faturamento-conciliado/faturamento-conciliado.model';
import { FiltroPendencias } from '../../../../core/models/faturamento-conciliado/filtro-pendencias.mode';
import { TableConciliacao } from '../../../../core/models/faturamento-conciliado/table-conciliacao.model';
import { ObterConciliacaoResponse } from '../../../../core/responses/faturamento-conciliado/obter-conciliacao.response';
import { FaturamentoConciliadoService } from '../../../../services/faturamento-conciliado.service';

@Component({
  selector: 'app-table-pendencias',
  templateUrl: './table-pendencias.component.html',
  styleUrls: ['./table-pendencias.component.scss']
})
export class TablePendenciasComponent {

  utility = Utility;
  Permissoes = Permissoes;

  pipe = new DatePipe('en-US');

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Input('atualizar') set atualizar(value) {
    if (this.init) {
      this.carregaGridPendencias();
    }
  }
  @Input('filtro') set setFiltro(value) {
    if (this.init) this.carregaGridPendencias(value);
  }

  @Input('aba') set setAba(abaPendenciasSelecionada: boolean) {
    this.abaPendenciasSelecionada = abaPendenciasSelecionada;
  }

  init: boolean = false;
  displayedColumns: string[] = [
    'empresa',
    'clienteId',
    'uf',
    'mesCompetencia',
    'quantidadeOperacoes',
    'quantidadeReembolsar',
    'valorNotaFiscal',
    'valorNotaDebito',
    'status',
    'acoes'
  ];

  totalItens = 0;
  items$: Observable<TableConciliacao[]>;
  refresh$ = new Subject();
  conciliacaoItens: TableConciliacao[] = [];
  dataSource = new MatTableDataSource(this.conciliacaoItens);
  readonly isLoadingResults$ = new BehaviorSubject(true);
  sortPendencias: string = null;

  timer: NodeJS.Timeout;
  abaPendenciasSelecionada: boolean = false;

  constructor(private store: Store<{ preloader: IPreloaderState }>,
    private faturamentoConciliadoService: FaturamentoConciliadoService,
    private router: Router) { }

  ngAfterViewInit() {
    Utility.watchCondition(
      this.timer,
      () => {
        if (!this.init && this.abaPendenciasSelecionada) {
          this.carregaGridPendencias();
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

  detalhar(id: number, empresa: string, uf: string) {
    this.faturamentoConciliadoService.mandarDadosPendencia({ empresa: empresa, uf: uf });
    this.router.navigate([`/monitor-faturamento/detalhar-pendencias/${id}`]);
  }

  sortData(sort: Sort) {
    this.sortPendencias = `${sort.active}.${sort.direction}`
    this.carregaGridPendencias();
  }

  private carregaGridPendencias(filtros: FiltroPendencias = null) {
    if (this.paginator) { this.paginator.pageIndex = 0; }

    this.items$ = merge(this.refresh$, this.paginator?.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarConciliacoes(this.paginator?.pageIndex, this.paginator?.pageSize, this.sortPendencias, filtros);
      }),
      map((result: { faturamentoConciliados: FaturamentoConciliado }) => {
        this.totalItens = result.faturamentoConciliados.totalCount;
        this.dataSource = new MatTableDataSource<TableConciliacao>(result.faturamentoConciliados.items);
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader())

        return result.faturamentoConciliados.items;
      }),
      catchError((err) => {
        this.isLoadingResults$.next(false);
        console.info(err);
        this.totalItens = 0;
        this.store.dispatch(closePreloader())
        return of([]);
      })
    );
    this.init = true;
  }

  private listarConciliacoes(pageIndex: number = 0, pageSize: number = 25, sort: string = null, filtros: FiltroPendencias = null): Observable<ObterConciliacaoResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))
    return this.faturamentoConciliadoService.obterTableConciliacao(pageIndex, pageSize, sort, [3], filtros);
  }
}
