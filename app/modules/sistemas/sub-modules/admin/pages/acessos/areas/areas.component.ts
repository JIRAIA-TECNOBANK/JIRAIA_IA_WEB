import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { Sort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, merge, Observable, of, Subject } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Utility } from 'src/app/core/common/utility';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { AreasFiltro } from '../../../core/models/areas/areas-filtro.model';
import { Area } from '../../../core/models/areas/areas.model';
import { ObterAreasPaginationResponse } from '../../../core/responses/areas/obter-areas-pagination.response';
import { AreasService } from '../../../../crm/services/areas.service';
import { Permissoes } from 'src/app/core/common/permissoes';

@Component({
  selector: 'app-areas',
  templateUrl: './areas.component.html',
  styleUrls: ['./areas.component.scss']
})

export class AreasComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  displayedColumns: string[] = [
    'nome',
    'email',
    'criadoEm',
    'modificadoEm',
    'status',
    'opcoes',
  ];

  areas: Area[] = [];
  dataSource = new MatTableDataSource(this.areas);
  totalRegistros: number = 0;
  area: Area;
  items$: Observable<Area[]>;
  refresh$ = new Subject();
  pipe = new DatePipe('en-US');
  sortListaAreas: string = '';
  readonly isLoadingResults$ = new BehaviorSubject(true);

  filterActive: boolean = false;
  areaCustomControl: FormControl;

  filtroArea = null;
  filterListaAreas: FieldOption[] = [];

  filter: GridFilter = <GridFilter>{
    id: 'areas',
    customFields: false,
    fields: [
      <FilterField>{ id: 'areaNome', titulo: 'Por nome da área', tipo: TipoFilterField.Checkbox, options: this.filterListaAreas, searchInput: true, showTooltip: true },
      <FilterField>{ id: 'areaEmail', titulo: 'Por e-mail', tipo: TipoFilterField.Text, validators: Validators.minLength(3) },
      <FilterField>{
        id: 'areaStatus', titulo: 'Por status', tipo: TipoFilterField.Checkbox, selectAllOptions: 'Todas', options: [
          <FieldOption>{ value: true, label: 'Ativas' },
          <FieldOption>{ value: false, label: 'Inativas' }]
      }
    ]
  }
  childstate: boolean = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private router: Router,
    private areasService: AreasService,
    private store: Store<{ preloader: IPreloaderState }>,
    private notifierService: NotifierService
  ) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) this.childstate = val['url']?.includes('incluir') || val['url']?.includes('editar');
      if (!this.childstate) this.refresh$.next(undefined);
    })
  }

  ngOnInit(): void {
    this.carregarAreasFiltro();
  }

  ngAfterViewInit() {
    this.carregaGridAreas();
  }

  carregaGridAreas() {
    if (this.paginator) { this.paginator.pageIndex = 0; }

    this.items$ = merge(this.refresh$, this.paginator.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarAreas(
          this.paginator.pageIndex,
          this.paginator.pageSize,
          this.filtroArea
        );
      }),
      map((result: { totalItems: number; areas: Area[] }) => {
        this.totalRegistros = result.totalItems;
        this.dataSource = new MatTableDataSource<Area>(result.areas);
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader())

        return result.areas;
      }),
      catchError((err) => {
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader())
        return of([]);
      })
    );
  }

  listarAreas(pageIndex: number = 0, pageSize: number = null, filtros: any = null): Observable<ObterAreasPaginationResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))

    const filtro = this.getParams(pageIndex, pageSize, filtros)
    return this.areasService.obterAreasPaginado(filtro, this.sortListaAreas, filtros?.get('areaNome') ?? []);
  }

  getParams(pageIndex: number = 0, pageSize: number = 5, filtros: any = null) {
    let filtro = <AreasFiltro>{
      email:
        filtros != null
          ? filtros.get('areaEmail') != null
            ? filtros.get('areaEmail')
            : ''
          : '',
      ativo: filtros ? (filtros.get('areaStatus') ? (filtros.get('areaStatus').length >= 2 ? '' : filtros.get('areaStatus')[0]) : '') : '',
      pageIndex: pageIndex,
      pageSize: pageSize,
    };

    return filtro;
  }

  editarArea(areaId: number) {
    this.router.navigate([`/areas/editar-area/${areaId}`]);
  }

  inativarOuAtivarArea(area: Area, ativo: boolean) {
    this.store.dispatch(showPreloader({ payload: '' }))

    if (ativo) {
      this.inativarArea(area);
      return;
    }

    this.ativarArea(area);
  }

  search(event) {
    this.filtroArea = event;
    this.carregaGridAreas();
  }

  redefinir() {
    this.filtroArea = null;
    this.paginator.pageIndex = 0;
    this.carregaGridAreas();
  }

  setAreasIds(filterMap: Map<string, any>) {
    let areasIds = filterMap.get('areaNome');
    let filterAreaId = [];
    if (areasIds.length > 0) {
      areasIds.forEach(areaId => {
        filterAreaId.push("areaId=" + areaId + "&")
      });
    }

    this.filtroArea.push(filterAreaId)
  }

  formatDate(date: string) {
    return Utility.formatGridDate(date);
  }

  sortData(sort: Sort) {
    switch (sort.active) {
      case "nome":
        this.sortListaAreas = `nome.${sort.direction}`
        break;

      case "email":
        this.sortListaAreas = `email.${sort.direction}`
        break;

      case "status":
        this.sortListaAreas = `ativo.${sort.direction}`
        break;

      default:
        this.sortListaAreas = `${sort.active}.${sort.direction}`
        break;
    }

    this.listarAreas(0, 5, this.filtroArea);
    this.refresh$.next(undefined);
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }

  carregarAreasFiltro(nomeArea: string = '') {
    this.areasService.obterAreasPaginado(<AreasFiltro>{ nomeArea: nomeArea, pageIndex: 0, pageSize: 10 }, "nome.asc").subscribe(response => {
      if (response.isSuccessful) {
        let options = [];
        response.areas.forEach(area => { options.push(<FieldOption>{ value: area.id, label: area.nome }); })
        this.filter.fields.filter(field => field.id == "areaNome")[0].options = options;
      }
    })
  }

  searchFilter(event: FieldOption) {
    if (event.label == 'areaNome') {
      this.carregarAreasFiltro(event.value);
    }
  }

  goToIncluir(rota: string) {
    this.router.navigate([rota]);
    return;
  }

  private inativarArea(area: Area) {
    this.areasService.inativarArea(area.id).subscribe(
      response => {
        if (response.isSuccessful) {
          this.store.dispatch(closePreloader())
          this.notifierService.showNotification('Área inativada com sucesso!', 'Sucesso', 'success')
          this.refresh$.next(undefined);
        } else {
          this.store.dispatch(closePreloader())
          this.notifierService.showNotification(response.errors[0].message, null, 'error')
        }
      },
      error => {
        this.store.dispatch(closePreloader())
        this.notifierService.showNotification(error.error.errors[0].message, null, 'error')
      }
    )
  }

  private ativarArea(area: Area) {
    area.ativo = true;

    this.areasService.ativarArea(area.id, area).subscribe(
      response => {
        if (response.isSuccessful) {
          this.store.dispatch(closePreloader())
          this.notifierService.showNotification('Área ativada com sucesso!', 'Sucesso', 'success')
          this.refresh$.next(undefined);
        } else {
          this.store.dispatch(closePreloader())
          this.notifierService.showNotification(response.errors[0].message, null, 'error')
        }
      },
      error => {
        this.store.dispatch(closePreloader())
        this.notifierService.showNotification(error.error.errors[0].message, null, 'error')
      }
    )
  }
}
