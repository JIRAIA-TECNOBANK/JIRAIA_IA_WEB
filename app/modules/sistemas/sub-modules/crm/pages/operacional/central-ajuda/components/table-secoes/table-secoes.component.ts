import { animate, state, style, transition, trigger } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, BehaviorSubject, merge, of } from 'rxjs';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { ArtigosListagem } from 'src/app/modules/sistemas/sub-modules/crm/core/models/central-ajuda/artigos-listagem';
import { SecoesFiltro } from 'src/app/modules/sistemas/sub-modules/crm/core/models/central-ajuda/secoes-filtro';
import { SecoesPaginado } from 'src/app/modules/sistemas/sub-modules/crm/core/models/central-ajuda/secoes-paginado';
import { ObterSecoesPaginadoResponse } from 'src/app/modules/sistemas/sub-modules/crm/core/responses/central-ajuda/obter-secoes-paginado.response';
import { CentralAjudaService } from 'src/app/modules/sistemas/sub-modules/crm/services/central-ajuda.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';

@Component({
  selector: 'app-table-secoes',
  templateUrl: './table-secoes.component.html',
  styleUrls: ['./table-secoes.component.scss'],
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
export class TableSecoesComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  constructor(private store: Store<{ preloader: IPreloaderState }>,
    private centralAjudaSecaoService: CentralAjudaService, // CRM CentralAjudaService
    private router: Router,
    private notifierService: NotifierService) { }

  @ViewChild('paginatorSecao') paginatorSecao: MatPaginator;

  @Input('filtro') set setFiltro(value) {
    if (this.init) this.carregaGridCentralAjudaSecao(value)
  }
  @Input('atualizarGrid') set atualizarGrid(value) {
    if (this.init) this.carregaGridCentralAjudaSecao();
  }

  displayedColumnsSecao: string[] = [
    'titulo',
    'criadoPor',
    'artigos',
    'dataCadastro',
    'dataPublicacao',
    'status',
    'acoes'
  ];
  columnsToDisplayWithExpand = [...this.displayedColumnsSecao, 'expand'];

  itemsSecao$: Observable<SecoesPaginado[]>;
  centralAjudaSecao: SecoesPaginado[] = [];
  refresh$ = new Subject();
  pipe = new DatePipe('en-US');
  readonly isLoadingResults$ = new BehaviorSubject(true);

  dataSource = new MatTableDataSource(this.centralAjudaSecao);
  expandedElement: SecoesPaginado | null;
  totalItems = 0;
  init: boolean = false;
  totalRegistros: number;

  artigos: ArtigosListagem[] = [];

  ngOnInit(): void {
    //
  }

  ngAfterViewInit() {
    this.carregaGridCentralAjudaSecao();
    this.init = true;
  }

  carregaGridCentralAjudaSecao(filtros: SecoesFiltro = null) {
    if (this.paginatorSecao) {
      this.paginatorSecao.pageIndex = 0;
    }

    this.itemsSecao$ = merge(this.refresh$, this.paginatorSecao.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarCentralAjudaSecao(
          this.paginatorSecao.pageIndex,
          this.paginatorSecao.pageSize, null, filtros
        );
      }),
      map((result: { totalItems: number; listaSecao: SecoesPaginado[] }) => {
        this.totalItems = result.totalItems;
        this.dataSource = new MatTableDataSource<SecoesPaginado>(result.listaSecao);
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader());

        return result.listaSecao;
      }),
      catchError((err) => {
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader());
        return of([]);
      })
    );
  }

  listarCentralAjudaSecao(
    pageIndex: number = 0,
    pageSize: number = 25,
    sort = null,
    filtros: SecoesFiltro = null
  ): Observable<ObterSecoesPaginadoResponse> {
    this.store.dispatch(showPreloader({ payload: '' }));
    const filtro = this.getParams(pageIndex, pageSize, filtros, sort);
    return this.centralAjudaSecaoService.obterSecoesPaginado(filtro);
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginatorSecao.pageIndex = event.pageIndex;
    this.paginatorSecao.pageSize = event.pageSize;
    this.paginatorSecao.page.emit(event);
  }

  editarSecao(secaoId: number) {
    this.router.navigate([`/central-ajuda/editar-secao/${secaoId}`]);
  }

  formatDate(date: string) {
    return Utility.formatGridDate(date);
  }

  arquivarOuDesarquivarSecao(secaoId: number, ativo: boolean) {
    if (ativo) {
      this.centralAjudaSecaoService.arquivarSecao(secaoId).subscribe((result) => {
        if (result.errors) {
          this.notifierService.showNotification(result.errors[0].message, null, 'error');
          return;
        }

        this.notifierService.showNotification(
          'Seção arquivada com sucesso.',
          'Sucesso',
          'success'
        );
        this.refresh$.next(undefined);
      });
      return;
    }

    this.centralAjudaSecaoService.desarquivarSecao(secaoId).subscribe((result) => {
      if (result.errors) {
        this.notifierService.showNotification(result.errors[0].message, null, 'error');
        return;
      }

      this.notifierService.showNotification(
        'Seção desarquivada com sucesso.',
        'Sucesso',
        'success'
      );
      this.refresh$.next(undefined);
    });
  }

  expandDetail(secaoId: number, expandedElement: boolean) {
    if (expandedElement) {
      this.artigos = [];
      this.centralAjudaSecaoService.obterArtigosPorSecao(secaoId).subscribe(response => {
        if (response.artigos) {
          this.artigos = response.artigos;
          return;
        }
      })
    }
  }

  incluirArtigo(secaoId: number) {
    this.router.navigate([`/central-ajuda/incluir-artigo`, secaoId]);
  }

  private getParams(pageIndex: number = 0, pageSize: number = 25, filtros: SecoesFiltro = null, sort: string = null) {
    let filtro = <SecoesFiltro>{
      secao: filtros != null ? (filtros.secao != null ? filtros.secao : null) : null,
      usuarioGuid: filtros != null ? (filtros.usuarioGuid != null ? filtros.usuarioGuid : null) : null,
      secaoId: filtros != null ? (filtros.secaoId?.length > 0 ? filtros.secaoId : null) : null,
      status: filtros != null ? (filtros.status?.length > 0 ? filtros.status : null) : null,
      pageIndex: pageIndex,
      pageSize: pageSize,
      sort: sort
    }

    return filtro;
  }
}
