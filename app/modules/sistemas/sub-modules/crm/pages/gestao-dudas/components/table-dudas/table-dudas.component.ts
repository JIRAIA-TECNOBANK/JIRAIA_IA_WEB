import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatSort, Sort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { Documento } from 'src/app/modules/sistemas/core/models/documento.model';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { ParametrizaDudasFiltro } from '../../../../core/models/taxas/parametriza-dudas-filtro.model';
import { ParametrizaDudas } from '../../../../core/models/taxas/parametriza-dudas.model';
import { ObterDudasPaginationResponse } from '../../../../core/responses/taxas/obter-dudas-pagination.response';
import { TaxasService } from '../../../../services/taxas.service';

@Component({
  selector: 'app-table-dudas',
  templateUrl: './table-dudas.component.html',
  styleUrls: ['./table-dudas.component.scss']
})

export class TableDudasComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  @Input('filtro') set setFiltro(value) {
    if (this.init) { this.carregaGridDudas(value); }
  }

  @Input('atualizarGrid') set atualizarGrid(value) {
    if (this.init) { this.carregaGridDudas(); }
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = [
    'nome',
    'cnpj',
    'quantidadeDisponivel',
    'modificadoEm',
    'ativo',
    'acoes'
  ];

  parametrizaDudas: ParametrizaDudas[] = [];
  dataSource = new MatTableDataSource(this.parametrizaDudas);
  pesquisa = null;
  refresh$ = new Subject();
  pipe = new DatePipe('en-US');

  items$: Observable<ParametrizaDudas[]>;
  totalItems: number = 0;
  init: boolean = false;
  readonly isLoadingResults$ = new BehaviorSubject(true);

  sortGrid: string;

  constructor(
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private taxasService: TaxasService,
    private store: Store<{ preloader: IPreloaderState }>) { }

  ngOnInit(): void {
    //
  }

  ngAfterViewInit(): void {
    this.carregaGridDudas();
    this.init = true;
  }

  parametrizarDuda(empresaId: number, cnpj: string, quantidadeDisponivel: number, ultimaCompra: string) {
    this.route.navigate(['parametrizar-duda/' + empresaId], {
      relativeTo: this.activatedRoute, state: {
        cnpj,
        quantidadeDisponivel,
        ultimaCompra
      }
    })
  }

  detalhamento(id: number) {
    this.route.navigate([`detalhamento/${id}`], { relativeTo: this.activatedRoute });
  }

  compraManualDuda(cnpj: number, detranid: number) {
    this.route.navigate([`compra-manual/${cnpj}/${detranid}`], { relativeTo: this.activatedRoute })
  }

  formatDocumento() {
    return Documento.mascaraCNPJ();
  }

  formatDate(date: string) {
    return Utility.formatGridDate(date);
  }

  carregaGridDudas(filtro: ParametrizaDudasFiltro = null) {
    if (this.paginator) { this.paginator.pageIndex = 0; }

    this.items$ = merge(this.refresh$, this.paginator.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarDudas(
          this.paginator.pageIndex,
          this.paginator.pageSize,
          filtro
        );
      }),
      map((result: { totalItems: number; parametrizaDudas: ParametrizaDudas[] }) => {
        this.totalItems = result.totalItems;
        this.dataSource = new MatTableDataSource<ParametrizaDudas>(result.parametrizaDudas);
        this.isLoadingResults$.next(false);
        this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
          if (typeof data[sortHeaderId] === 'string') {
            return data[sortHeaderId].toLocaleLowerCase();
          }

          return data[sortHeaderId];
        };
        this.dataSource.sort = this.sort;
        this.store.dispatch(closePreloader())
        return result.parametrizaDudas;
      }),
      catchError((err) => {
        this.isLoadingResults$.next(false);
        console.info(err);
        this.store.dispatch(closePreloader())
        return of([]);
      })
    );
  }

  listarDudas(pageIndex: number = 0, pageSize: number = 25, filtros: ParametrizaDudasFiltro = null): Observable<ObterDudasPaginationResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))
    const filtro = this.getParams(pageIndex, pageSize, filtros)
    return this.taxasService.obterDudas(pageIndex, pageSize, filtro);
  }

  getParams(pageIndex: number = 0, pageSize: number = 5, filtros: ParametrizaDudasFiltro = null) {
    let filtro = <ParametrizaDudasFiltro>{
      empresaId: filtros != null ? (filtros.empresaId != null ? filtros.empresaId : '') : '',
      ativo: filtros != null ? (filtros.ativo != null ? filtros.ativo : '') : '',
      cnpj: filtros != null ? (filtros.cnpj != null ? filtros.cnpj : '') : '',
      quantidade: filtros != null ? (filtros.quantidade != null ? filtros.quantidade : '') : '',
      sort: this.sortGrid || ''
    }
    return filtro;
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }

  sortData(sort: Sort) {
    this.sortGrid = `${sort.active}.${sort.direction}`;

    this.listarDudas(this.paginator.pageIndex, this.paginator.pageSize);
    this.refresh$.next(undefined);
  }
}
