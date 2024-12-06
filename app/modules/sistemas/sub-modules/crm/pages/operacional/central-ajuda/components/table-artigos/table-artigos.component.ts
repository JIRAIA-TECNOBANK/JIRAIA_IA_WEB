import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { DatePipe } from '@angular/common';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { BehaviorSubject, Observable, Subject, merge, of } from 'rxjs';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';

import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { ArtigosPaginado } from '../../../../../core/models/central-ajuda/artigos-paginado';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { ObterArtigosPaginadoResponse } from '../../../../../core/responses/central-ajuda/obter-artigos-paginado.response';
import { CentralAjudaService } from '../../../../../services/central-ajuda.service';
import { ArtigosFiltro } from '../../../../../core/models/central-ajuda/artigos-filtro';

@Component({
  selector: 'app-table-artigos',
  templateUrl: './table-artigos.component.html',
  styleUrls: ['./table-artigos.component.scss']
})
export class TableArtigosComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  constructor(private store: Store<{ preloader: IPreloaderState }>,
    private router: Router,
    private notifierService: NotifierService,
    private centralAjudaService: CentralAjudaService) { }

  @ViewChild('paginatorArtigo') paginatorArtigo: MatPaginator;
  @Input('filtro') set setFiltro(value) {
    if (this.init) this.carregaGridCentralAjudaArtigo(value)
  }

  @Input('atualizarGrid') set atualizarGrid(value) {
    if (this.init) this.carregaGridCentralAjudaArtigo();
  }

  displayedColumnsArtigo: string[] = [
    'titulo',
    'criadoPor',
    'secao',
    'dataCadastro',
    'dataPublicacao',
    'status',
    'acoes'
  ];

  itemsArtigo$: Observable<ArtigosPaginado[]>;
  centralAjudaArtigo: ArtigosPaginado[] = [];
  refresh$ = new Subject();
  pipe = new DatePipe('en-US');
  readonly isLoadingResults$ = new BehaviorSubject(true);

  dataSource = new MatTableDataSource(this.centralAjudaArtigo);
  totalItems = 0;
  init: boolean = false;
  totalRegistros: number;

  ngOnInit(): void {
    //
  }

  ngAfterViewInit() {
    this.carregaGridCentralAjudaArtigo();
    this.init = true;
  }

  carregaGridCentralAjudaArtigo(filtro: ArtigosFiltro = null) {
    if (this.paginatorArtigo) {
      this.paginatorArtigo.pageIndex = 0;
    }

    this.itemsArtigo$ = merge(this.refresh$, this.paginatorArtigo.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarCentralAjudaArtigo(
          this.paginatorArtigo.pageIndex,
          this.paginatorArtigo.pageSize,
          null,
          filtro
        );
      }),
      map((result: { totalItems: number; listaArtigos: ArtigosPaginado[] }) => {
        this.totalItems = result.totalItems;
        this.dataSource = new MatTableDataSource<ArtigosPaginado>(result.listaArtigos);
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader());

        return result.listaArtigos;
      }),
      catchError((err) => {
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader());
        return of([]);
      })
    );
  }

  listarCentralAjudaArtigo(
    pageIndex: number = 0,
    pageSize: number = 25,
    sort = '',
    filtros: ArtigosFiltro = null
  ): Observable<ObterArtigosPaginadoResponse> {
    this.store.dispatch(showPreloader({ payload: '' }));
    const filtro = this.getParams(pageIndex, pageSize, filtros, sort);

    return this.centralAjudaService.obterArtigosPaginado(filtro);
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginatorArtigo.pageIndex = event.pageIndex;
    this.paginatorArtigo.pageSize = event.pageSize;
    this.paginatorArtigo.page.emit(event);
  }

  editarArtigo(artigoId: number) {
    this.router.navigate([`/central-ajuda/editar-artigo/${artigoId}`]);
  }

  formatDate(date: string) {
    return Utility.formatGridDate(date);
  }

  arquivarOuDesarquivarArtigo(artigoId: number, ativo: boolean) {
    if (ativo) {
      this.centralAjudaService.arquivarArtigo(artigoId).subscribe((result) => {
        if (result.errors) {
          this.notifierService.showNotification(result.errors[0].message, null, 'error');
          return;
        }

        this.notifierService.showNotification(
          'Artigo arquivado com sucesso.',
          'Sucesso',
          'success'
        );
        this.refresh$.next(undefined);
      });
      return;
    }

    this.centralAjudaService.desarquivarArtigo(artigoId).subscribe((result) => {
      if (result.errors) {
        this.notifierService.showNotification(result.errors[0].message, null, 'error');
        return;
      }

      this.notifierService.showNotification(
        'Artigo desarquivado com sucesso.',
        'Sucesso',
        'success'
      );
      this.refresh$.next(undefined);
    });
  }

  private getParams(pageIndex: number = 0, pageSize: number = 25, filtros: ArtigosFiltro = null, sort: string = null) {
    let filtro = <ArtigosFiltro>{
      usuarios: filtros != null ? (filtros.usuarios?.length > 0 ? filtros.usuarios : null) : null,
      secaoId: filtros != null ? (filtros.secaoId?.length > 0 ? filtros.secaoId : null) : null,
      artigoId: filtros != null ? (filtros.artigoId?.length > 0 ? filtros.artigoId : null) : null,
      statusArtigos: filtros != null ? (filtros.statusArtigos?.length > 0 ? filtros.statusArtigos : null) : null,
      pageIndex: pageIndex,
      pageSize: pageSize,
      sort: sort
    }

    return filtro;
  }
}
