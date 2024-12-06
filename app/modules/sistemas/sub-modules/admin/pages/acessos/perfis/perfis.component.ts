import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, merge, Observable, of, Subject } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FilterCustomField } from 'src/app/shared/core/models/grid-filter/filter-custom-field.model';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { Perfil } from '../../../core/models/perfis/perfil.model';
import { PerfilFiltro } from '../../../core/models/perfis/perfilFiltro.model';
import { DominiosResponse } from '../../../core/responses/dominios/dominios.response';
import { ObterPerfisPaginationResponse } from '../../../core/responses/perfis/obter-perfis-pagination.response';
import { PerfisService } from '../../../services/perfis.service';
import { PortalDominioService } from '../../../services/_portal/portal-dominio.service';

@Component({
  selector: 'app-perfis',
  templateUrl: './perfis.component.html',
  styleUrls: ['./perfis.component.scss'],
})
export class PerfisComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  constructor(
    private store: Store<{ preloader: IPreloaderState }>,
    private portalDominioService: PortalDominioService,
    private perfisService: PerfisService,
    private router: Router,
    private notifierService: NotifierService) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) {
        this.childstate = val['url']?.includes('incluir') || val['url']?.includes('editar');

        if (!this.childstate && this.init) {
          if (this.refresh$.observers.length == 0) this.carregaGridPerfis();
          else this.refresh$.next(undefined);
        }
      }
    })
  }

  displayedColumnsPerfis: string[] = [
    'nome',
    'descricao',
    'criadoEm',
    'modificadoEm',
    'ativo',
    'acoes',
  ];

  @Input() empresaId: number;
  @Output('hasActivePerfil') hasActivePerfil: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  @Output('clickEditar') clickEditar: EventEmitter<number> =
    new EventEmitter<number>();
  @ViewChild('paginatorPerfis') paginatorPerfis: MatPaginator;
  @ViewChild('tablePerfis') perfisSort: MatSort;

  itemsPerfis$: Observable<Perfil[]>;
  perfis: Perfil[] = [];
  items$: Observable<Perfil[]>;
  refresh$ = new Subject();
  pipe = new DatePipe('en-US');
  readonly isLoadingResults$ = new BehaviorSubject(true);

  dataSource = new MatTableDataSource(this.perfis);
  totalItems = 0;

  childstate: boolean = false;
  init: boolean = false;

  sortListaPerfis: string = '';

  showRedefinirBtn: boolean = false;
  filtroPerfil: PerfilFiltro = null;
  filterListaPerfis: FieldOption[] = [];

  filterOptionPeriodo: FieldOption[] = [];
  fieldNome: FilterField = <FilterField>{
    id: 'Nome',
    titulo: 'Por perfil',
    tipo: TipoFilterField.Checkbox,
    options: [],
    searchInput: true,
    showTooltip: true
  };

  filter: GridFilter = <GridFilter>{
    id: 'perfis',
    customFields: false,
    fields: [
      this.fieldNome,
      <FilterField>{
        id: 'periodo',
        titulo: 'Por período',
        tipo: TipoFilterField.Period,
        options: this.filterOptionPeriodo,
        customFields: [
          <FilterCustomField>{ id: 'De' },
          <FilterCustomField>{ id: 'Ate' },
        ],
      },
      <FilterField>{
        id: 'Ativo',
        titulo: 'Por status',
        tipo: TipoFilterField.Checkbox,
        selectAllOptions: 'Todos',
        options: [
          <FieldOption>{ value: true, label: 'Ativos' },
          <FieldOption>{ value: false, label: 'Inativos' },
        ],
      },
    ],
  };

  ngOnInit(): void {
    this.carregarPeriodo();
  }

  ngAfterViewInit(): void {
    this.init = true;
    if (!this.childstate) {
      this.carregaGridPerfis();
    }
  }

  carregaGridPerfis() {
    if (this.paginatorPerfis) {
      this.paginatorPerfis.pageIndex = 0;
    }

    this.items$ = merge(this.refresh$, this.paginatorPerfis.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarPerfis(
          this.paginatorPerfis.pageIndex,
          this.paginatorPerfis.pageSize,
          this.filtroPerfil,
          this.sortListaPerfis
        );
      }),
      map((result: { totalItems: number; perfis: Perfil[] }) => {
        this.totalItems = result.totalItems;
        this.dataSource = new MatTableDataSource<Perfil>(result.perfis);
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader());

        return result.perfis;
      }),
      catchError((err) => {
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader());
        return of([]);
      })
    );
  }

  listarPerfis(
    pageIndex: number = 0,
    pageSize: number = 25,
    filtros: PerfilFiltro = null,
    sort = ''
  ): Observable<ObterPerfisPaginationResponse> {
    this.store.dispatch(showPreloader({ payload: '' }));

    const filtro = this.getParams(filtros);
    return this.perfisService.obterPerfisPaginado(pageIndex, pageSize, filtro, sort);
  }

  getParams(filtros: PerfilFiltro = null) {
    let filtro = <PerfilFiltro>{
      de: filtros != null ? (filtros.de != null ? filtros.de : '') : '',
      ate: filtros != null ? (filtros.ate != null ? filtros.ate : '') : '',
      ativo: filtros != null ? (filtros.ativo != null ? filtros.ativo : '') : '',
      perfilId: filtros != null ? (filtros.perfilId != null ? filtros.perfilId : '') : '',
    }

    return filtro;
  }

  sortData(sort: Sort) {
    switch (sort.active) {
      case 'nome':
        this.sortListaPerfis = `nome.${sort.direction}`;

        break;

      case 'descricao':
        this.sortListaPerfis = `descricao.${sort.direction}`;
        break;

      case 'ativo':
        this.sortListaPerfis = `ativo.${sort.direction}`;
        break;

      case 'criadoEm':
        this.sortListaPerfis = `criadoEm.${sort.direction}`;
        break;

      case 'modificadoEm':
        this.sortListaPerfis = `modificadoEm.${sort.direction}`;
        break;

      default:
        this.sortListaPerfis = `${sort.active}.${sort.direction}`;
        break;
    }

    this.listarPerfis(0, 5, this.filtroPerfil, this.sortListaPerfis);
    this.refresh$.next(undefined);
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginatorPerfis.pageIndex = event.pageIndex;
    this.paginatorPerfis.pageSize = event.pageSize;
    this.paginatorPerfis.page.emit(event);
  }

  onClickEditar(id: number) {
    this.clickEditar.emit(id);
  }

  editarPerfil(perfilId: number) {
    this.router.navigate([`/perfis/editar-perfil/${perfilId}`]);
  }

  formatDate(date: string) {
    return Utility.formatGridDate(date);
  }

  redefinir() {
    this.filtroPerfil = null;
    this.paginatorPerfis.pageIndex = 0;
    this.showRedefinirBtn = false;
    this.carregaGridPerfis();
  }

  search(event) {
    this.filtroPerfil = <PerfilFiltro>{
      de: event.get('De'),
      ate: event.get('Ate'),
      ativo: event.get('Ativo')?.length == 1 ? event.get('Ativo') : null,
      perfilId: event.get('Nome')
    }

    this.showRedefinirBtn = true;
    this.carregaGridPerfis();
  }

  inativarOuAtivarPerfil(perfilId: number, ativo: boolean) {
    if (ativo) {
      this.perfisService.inativarPerfil(perfilId).subscribe((result) => {
        if (result.errors) {
          this.notifierService.showNotification(result.errors[0].message, null, 'error');
          return;
        }

        this.notifierService.showNotification(
          'Perfil inativado.',
          'Sucesso',
          'success'
        );
        this.refresh$.next(undefined);
      });
      return;
    }

    this.perfisService.ativarPerfil(perfilId).subscribe((result) => {
      if (result.errors) {
        this.notifierService.showNotification(result.errors[0].message, null, 'error');
        return;
      }

      this.notifierService.showNotification(
        'Perfil ativado.',
        'Sucesso',
        'success'
      );
      this.refresh$.next(undefined);
    });
  }

  private carregarPeriodo() {
    this.portalDominioService.obterPorTipo('PERIODO').subscribe(
      (response: DominiosResponse) => {
        if (response.isSuccessful) {
          response.valorDominio.forEach((periodo) => {
            this.filterOptionPeriodo.push(<FieldOption>{
              value: periodo.palavraChave,
              label: periodo.valor,
            });
          });
        }

        response.errors.forEach((error) => {
          console.info(`${error.code}-${error.message}`);
        });
      },
      (error) => console.info(error)
    );
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(tipoElemento, nomeElemento, guidElemento);
  }

  searchField(event) {
    let filtro = new PerfilFiltro();

    if (event.value) filtro.nome = event.value;
    this.carregarPerfisFiltro(filtro);
  }

  private carregarPerfisFiltro(filtro: PerfilFiltro = null) {
    let sort = "nome.asc";

    this.perfisService.obterPerfisPaginado(0, 10, filtro, sort).subscribe(response => {
      let options = [];

      response.perfis.forEach(perfil => {
        options.push(<FieldOption>{
          label: perfil.nome,
          value: perfil.id
        });
      });

      this.fieldNome.options = options;
    });
  }
}
