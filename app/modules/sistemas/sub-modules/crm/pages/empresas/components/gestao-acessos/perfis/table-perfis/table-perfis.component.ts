import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Store } from '@ngrx/store';
import { BehaviorSubject, merge, Observable, of, Subject } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Utility } from 'src/app/core/common/utility';
import { Perfil } from 'src/app/modules/sistemas/sub-modules/admin/core/models/perfis/perfil.model';
import { PerfisFiltro } from 'src/app/modules/sistemas/sub-modules/crm/core/models/perfis/perfis-filtro.model';
import { ObterPerfisResponse } from 'src/app/modules/sistemas/sub-modules/crm/core/responses/perfis/obter-perfis.response';
import { EmpresasService } from 'src/app/modules/sistemas/sub-modules/crm/services/empresas.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { Permissoes } from '../../../../../../../../../../core/common/permissoes';

@Component({
  selector: 'app-table-perfis',
  templateUrl: './table-perfis.component.html',
  styleUrls: ['./table-perfis.component.scss']
})
export class TablePerfisComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  constructor(private store: Store<{ preloader: IPreloaderState }>, private empresaService: EmpresasService) { }

  displayedColumnsPerfis: string[] = [
    'id',
    'criadoEm',
    'modificadoEm',
    'ativo',
    'acoes',
  ];

  @Input() empresaId: number;
  @Input('refreshGrid') set setRefreshGrid(value) {
    if (this.init) {
      if (this.refreshPerfis$.observers.length == 0) this.carregaGridPerfis(value);
      else this.refreshPerfis$.next(undefined);
    }
  }
  @Input('filtro') set setFiltro(value) {
    if (this.init) { this.carregaGridPerfis(value); }
  }
  @Output('hasActivePerfil') hasActivePerfil: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output('clickEditar') clickEditar: EventEmitter<number> = new EventEmitter<number>();
  @ViewChild('paginatorPerfis') paginatorPerfis: MatPaginator;
  @ViewChild('tablePerfis') perfisSort: MatSort;

  itemsPerfis$: Observable<Perfil[]>;
  perfis: Perfil[] = [];
  dataSourcePerfis = new MatTableDataSource(this.perfis);
  refreshPerfis$ = new Subject();
  totalItemsPerfis = 0;
  init: boolean = false;

  readonly isLoadingResultsPerfis$ = new BehaviorSubject(true);

  ngOnInit(): void {
    //
  }

  ngAfterViewInit() {
    this.init = true;
    this.carregaGridPerfis();
    this.verificaPerfisAtivos();
  }

  carregaGridPerfis(filtros: PerfisFiltro = null) {
    if (this.paginatorPerfis) { this.paginatorPerfis.pageIndex = 0; }

    this.itemsPerfis$ = merge((this.paginatorPerfis == undefined ? 0 : this.paginatorPerfis.page)).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResultsPerfis$.next(true);
        return this.listarPerfis(
          this.empresaId,
          this.paginatorPerfis?.pageIndex,
          this.paginatorPerfis?.pageSize,
          filtros
        );
      }),
      map((result: { totalItems: number; perfis: Perfil[] }) => {
        this.totalItemsPerfis = result.totalItems;
        this.dataSourcePerfis = new MatTableDataSource<Perfil>(result.perfis);
        this.isLoadingResultsPerfis$.next(false);
        this.dataSourcePerfis.sort = this.perfisSort;

        this.store.dispatch(closePreloader())
        return result.perfis;
      }),
      catchError((err) => {
        this.isLoadingResultsPerfis$.next(false);
        console.info(err);
        this.store.dispatch(closePreloader())
        return of([]);
      })
    );
  }

  listarPerfis(empresaId: number, pageIndex: number, pageSize: number, filtros: PerfisFiltro = null): Observable<ObterPerfisResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))
    const filtro = this.getParams(pageIndex, pageSize, filtros)
    return this.empresaService.obterPerfis(empresaId, filtro);
  }

  getParams(pageIndex: number = 0, pageSize: number = 25, filtros: PerfisFiltro = null) {
    let filtro = <PerfisFiltro>{
      de: '',
      ate: '',
      pageIndex: pageIndex,
      pageSize: pageSize
    };

    if (filtros) {
      if (filtros.de) { filtro.de = filtros.de; }
      if (filtros.ate) { filtro.ate = filtros.ate; }
      if (filtros.status) { filtro.status = filtros.status; }
      if (filtros.perfilId?.length > 0) { filtro.perfilId = filtros.perfilId; }
    }

    return filtro;
  }

  verificaPerfisAtivos() {
    this.empresaService.obterPerfis(this.empresaId, <PerfisFiltro>{ status: true, pageIndex: 0, pageSize: 1 }).subscribe(response => {
      this.hasActivePerfil.emit(response.perfis.length > 0);
    });
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginatorPerfis.pageIndex = event.pageIndex;
    this.paginatorPerfis.pageSize = event.pageSize;
    this.paginatorPerfis.page.emit(event);
  }

  onClickEditar(id: number) {
    if (!Utility.getPermission([Permissoes.GESTAO_EMPRESA_USUARIO_CRM_CADASTRAR])) return;
    this.clickEditar.emit(id);
  }

  formatDate(date: string) {
    return Utility.formatGridDate(date);
  }
}
