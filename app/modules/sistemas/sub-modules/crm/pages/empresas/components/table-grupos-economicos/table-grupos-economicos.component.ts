import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import {
  closePreloader,
  showPreloader,
} from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { GruposEconomicos } from '../../../../core/models/grupos-economicos/grupos-economicos.model';
import { ObterGruposEconomicosResponse } from '../../../../core/responses/grupos-economicos/obter-grupos-economicos.response';
import { GruposEconomicosService } from '../../../../services/grupos-economicos.service';

import { Store } from '@ngrx/store';
import { BehaviorSubject, merge, Observable, of, Subject } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Utility } from 'src/app/core/common/utility';
import { Permissoes } from '../../../../../../../../core/common/permissoes';
import { GruposEconomicosFiltro } from '../../../../core/models/grupos-economicos/grupos-economicos-filtro.model';

@Component({
  selector: 'app-table-grupos-economicos',
  templateUrl: './table-grupos-economicos.component.html',
  styleUrls: ['./table-grupos-economicos.component.scss'],
})
export class TableGruposEconomicosComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  @Input('filtro') set setFiltro(value) {
    if (this.init) {
      this.carregaGridGrupos(value);
    }
  }

  displayedColumns: string[] = [
    'id',
    'nome',
    'quantidadeEmpresa',
    'criadoEm',
    'modificadoEm',
    'ativo',
    'opcoes',
  ];

  gruposEconomicos: GruposEconomicos[] = [];
  dataSource = new MatTableDataSource(this.gruposEconomicos);
  totalRegistros: number = 0;
  grupoEconomico: GruposEconomicos;
  items$: Observable<GruposEconomicos[]>;
  totalItems = 0;
  refresh$ = new Subject();
  pipe = new DatePipe('en-US');
  init: boolean = false;
  readonly isLoadingResults$ = new BehaviorSubject(true);

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private gruposEconomicosService: GruposEconomicosService,
    private notifierService: NotifierService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private store: Store<{ preloader: IPreloaderState }>
  ) {
    router.events.subscribe((val) => {
      let navEnd =
        val instanceof NavigationEnd &&
        val.urlAfterRedirects == '/organizacoes?tab=grupos-economicos';

      if (navEnd) {
        this.refresh$.next(undefined);
      }
    });
  }

  ngOnInit(): void {
    //
  }

  ngAfterViewInit() {
    this.carregaGridGrupos();
    this.init = true;
  }

  carregaGridGrupos(filtros: GruposEconomicosFiltro = null) {
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }

    this.items$ = merge(this.refresh$, this.paginator.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarGruposEconomicos(
          this.paginator.pageIndex,
          this.paginator.pageSize,
          filtros
        );
      }),
      map(
        (result: {
          totalItems: number;
          gruposEconomicos: GruposEconomicos[];
        }) => {
          this.totalItems = result.totalItems;
          this.dataSource = new MatTableDataSource<GruposEconomicos>(
            result.gruposEconomicos
          );
          this.isLoadingResults$.next(false);
          this.dataSource.sort = this.sort;
          this.store.dispatch(closePreloader());

          return result.gruposEconomicos;
        }
      ),
      catchError((err) => {
        this.isLoadingResults$.next(false);
        console.info(err);
        this.store.dispatch(closePreloader());
        return of([]);
      })
    );
  }

  listarGruposEconomicos(
    pageIndex: number,
    pageSize: number,
    filtros: GruposEconomicosFiltro = null
  ): Observable<ObterGruposEconomicosResponse> {
    this.store.dispatch(showPreloader({ payload: '' }));

    const filtro = this.getParams(pageIndex, pageSize, filtros);
    return this.gruposEconomicosService.obterGruposEconomicos(
      pageIndex,
      pageSize,
      filtro
    );
  }

  getParams(
    pageIndex: number = 0,
    pageSize: number = 5,
    filtros: GruposEconomicosFiltro = null
  ) {
    let filtro = <GruposEconomicosFiltro>{
      ...filtros,
    };

    return filtro;
  }

  inativarGrupo(grupoEconomicoId: string, ativo: boolean) {
    if (ativo) {
      this.gruposEconomicosService
        .inativarGrupoEconomico(grupoEconomicoId)
        .subscribe((result) => {
          if (result.grupoEconomicoId) {
            this.notifierService.showNotification(
              'Grupo econômico inativado.',
              'Sucesso',
              'success'
            );
            this.listarGruposEconomicos(
              this.paginator.pageIndex,
              this.paginator.pageSize
            );
            this.refresh$.next(undefined);
          }
        });
      return;
    }

    this.gruposEconomicosService
      .ativarGrupoEconomico(grupoEconomicoId)
      .subscribe((result) => {
        if (result.grupoEconomicoId) {
          this.notifierService.showNotification(
            'Grupo econômico ativado.',
            'Sucesso',
            'success'
          );
          this.listarGruposEconomicos(
            this.paginator.pageIndex,
            this.paginator.pageSize
          );
          this.refresh$.next(undefined);
        }
      });
  }

  formatDate(date: string) {
    return Utility.formatGridDate(date);
  }

  editarGrupoEconomico(grupoEconomicoId: number) {
    this.router.navigate(
      ['../organizacoes/grupos-economicos/atualizar-grupo/', grupoEconomicoId],
      {
        relativeTo: this.activatedRoute,
      }
    );
  }

  goTo(params: string) {
    this.router.navigate([`${params}`], { relativeTo: this.activatedRoute });
  }

  vincula(grupoId: number) {
    this.goTo(
      `../organizacoes/grupos-economicos/atualizar-grupo/${grupoId}/vincular-empresas`
    );
  }

  criarEmpresas(grupoId: number) {
    this.goTo(`../organizacoes/grupos-economicos/atualizar-grupo/${grupoId}/criar-empresa`);
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }
}
