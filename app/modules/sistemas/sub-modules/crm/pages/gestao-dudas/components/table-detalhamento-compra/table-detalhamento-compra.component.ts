import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Utility } from 'src/app/core/common/utility';
import { BreadcrumbService } from 'src/app/shared/services/breadcrumb.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { DetalhamentoCompra, DetalhesCompra } from '../../../../core/models/taxas/detalhamento-compra-duda.model';
import { DetalhamentoDudaFiltro } from '../../../../core/models/taxas/detalhamento-duda-filtro.model';
import { ObterDetalhamentoDudaResponse } from '../../../../core/responses/taxas/obter-detalhes-compras.response';
import { ObterDetalhesDudaResponse } from '../../../../core/responses/taxas/obter-resumo-compras.response';
import { TaxasService } from '../../../../services/taxas.service';

@Component({
  selector: 'app-table-detalhamento-compra',
  templateUrl: './table-detalhamento-compra.component.html',
  styleUrls: ['./table-detalhamento-compra.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class TableDetalhamentoCompraComponent implements AfterViewInit {

  utility = Utility;

  public parametrizaDudaId: number;

  refresh$ = new Subject();

  readonly isLoadingResults$ = new BehaviorSubject(true);

  public colunas: string[] = [
    'NumeroSolicitacao',
    'TipoCompra',
    'DataInclusao',
    'Total',
    'TotalEnviar',
    'TotalErro',
    'TotalEnviado', 
    'TotalPago',
    'Justificativa'
  ];

  public colunasDetalhes = [...this.colunas, 'expand'];

  public detalhes: DetalhesCompra[];

  public dataSource = new MatTableDataSource([]);

  public items$: Observable<DetalhamentoCompra[]>;

  public totalRegistros: number = 0;

  public init: boolean = false;

  public empresaNome: string;
  public empresaCnpj: string;

  @Input('filtro') set setFiltro(value) {
    if (this.init) this.carregaGrid(value);
  }

  @ViewChild('paginator') paginator: MatPaginator;

  @Input('refreshGrid') set onRefreshGrid(value) { if (this.init) this.carregaGrid(this.setFiltro); }

  @Input('refresh') set refreshGrid(value) { this.refresh$.next(undefined); }

  constructor(
    private store: Store<{ preloader: IPreloaderState }>,
    private activatedRoute: ActivatedRoute,
    private taxasServico: TaxasService,
    private breadcrumbService: BreadcrumbService) {
    this.parametrizaDudaId = this.activatedRoute.snapshot.params['id'];
  }

  ngAfterViewInit() {
    this.carregaGrid();
    this.init = true;
  }

  carregaGrid(filtro: DetalhamentoDudaFiltro = null) {
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }

    this.items$ = merge(this.refresh$, this.paginator?.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarDetalhamento(
          this.paginator.pageIndex,
          this.paginator.pageSize,
          filtro
        );
      }),
      map((result: { totalItems: number; detalhamentoDudas: DetalhamentoCompra[], nomeEmpresa: string, cnpjEmpresa: string }) => {
        this.totalRegistros = result.totalItems;
        this.empresaNome = result.nomeEmpresa;
        this.empresaCnpj = result.cnpjEmpresa;
        this.dataSource = new MatTableDataSource<DetalhamentoCompra>(result.detalhamentoDudas);
        this.paginator = this.dataSource.paginator;
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader());

        if (this.empresaNome) { this.breadcrumbService.carregarPaginaTitulo(`Detalhamento de compra Duda - ${this.empresaNome} (${this.utility.formatCnpj(this.empresaCnpj)})`); }
        return result.detalhamentoDudas;
      }),
      catchError((err) => {
        this.isLoadingResults$.next(false);
        console.info(err);
        this.store.dispatch(closePreloader());
        return of([]);
      })
    );
  }

  private listarResumo(parametrizaDudaId: number, numeroSolicitacao: number): Observable<ObterDetalhesDudaResponse> {
    this.store.dispatch(showPreloader({ payload: '' }));
    return this.taxasServico.obterDetalhesDudas(parametrizaDudaId, numeroSolicitacao);
  }

  private listarDetalhamento(pageIndex: number, pageSize: number, filtro: DetalhamentoDudaFiltro): Observable<ObterDetalhamentoDudaResponse> {
    this.store.dispatch(showPreloader({ payload: '' }));
    return this.taxasServico.obterDetalhamentoDudas(pageIndex, pageSize, this.parametrizaDudaId, filtro);
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.length = event.length;
    this.paginator.page.emit(event);
  }

  public expandirDetalhes(numeroSolicitacao: number, expandedElement: boolean) {
    if (!expandedElement) {
      this.detalhes = [];
      this.store.dispatch(closePreloader());
    }
    else {
      this.detalhes = [];

      this.listarResumo(this.parametrizaDudaId, numeroSolicitacao).subscribe(observer => {
        this.detalhes = observer.detalhes;
        this.store.dispatch(closePreloader());
      });
    }
  }
}
