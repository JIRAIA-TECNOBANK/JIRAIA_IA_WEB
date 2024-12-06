import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject, of, merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { BannersPaginado } from '../../../../core/models/configuracoes/gestao-banners/banners-paginado.model';
import { ObterBannersPaginadoResponse } from '../../../../core/responses/configuracoes/gestao-banners/obter-banners-paginado.response';
import { ConfiguracoesService } from '../../../../services/configuracoes.service';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { DominioService } from '../../../../services/dominio.service';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { AbstractControl, FormControl } from '@angular/forms';
import { FilterCustomField } from 'src/app/shared/core/models/grid-filter/filter-custom-field.model';
import { BannerFiltro } from '../../../../core/models/configuracoes/gestao-banners/banner-filtro.model';
import { DominiosResponse } from '../../../../core/responses/dominios/dominios.response';
import { PortalDominioService } from 'src/app/modules/sistemas/sub-modules/admin/services/_portal/portal-dominio.service';
import { FilterFieldReturn } from 'src/app/shared/core/models/grid-filter/filter-field-return.model';

@Component({
  selector: 'app-gestao-banners',
  templateUrl: './gestao-banners.component.html',
  styleUrls: ['./gestao-banners.component.scss']
})
export class GestaoBannersComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  constructor(
    private store: Store<{ preloader: IPreloaderState }>,
    private configuracoesService: ConfiguracoesService,
    private router: Router,
    private notifierService: NotifierService,
    private dominioService: DominioService,
    private portalDominioService: PortalDominioService) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) this.childstate = val['url']?.includes('incluir') || val['url']?.includes('editar');
      if (this.init && !this.childstate) {
        this.refresh$.next(undefined);
      }
    });

    this.minInitialDate = new Date();
  }

  displayedColumns: string[] = [
    'titulo',
    'tipo',
    'dataInicio',
    'dataFim',
    'status',
    'acoes',
  ];

  fieldBannerTitulo: FilterField = <FilterField>{
    id: 'bannerId',
    titulo: 'Por título',
    tipo: TipoFilterField.Checkbox,
    options: [],
    searchInput: true,
    showTooltip: true
  };

  fieldTipoBanner: FilterField = <FilterField>{
    id: 'tipoBanner',
    titulo: 'Por tipo de banner',
    tipo: TipoFilterField.Checkbox,
    options: []
  };

  fieldPeriodo: FilterField = <FilterField>{
    id: 'periodo',
    titulo: 'Por período',
    tipo: TipoFilterField.Period,
    options: [],
    customFields: [
      <FilterCustomField>{ id: 'De' },
      <FilterCustomField>{ id: 'Ate' },
    ],
  };

  fieldStatus: FilterField = <FilterField>{
    id: 'ativo',
    titulo: 'Por status',
    tipo: TipoFilterField.Checkbox,
    selectAllOptions: 'Todos',
    options: [
      <FieldOption>{ value: 1, label: 'Ativos' },
      <FieldOption>{ value: 2, label: 'Inativos' },
      <FieldOption>{ value: 3, label: 'Agendados' }
    ],
  };

  filter: GridFilter = <GridFilter>{
    id: 'banners',
    customFields: true,
    fields: [
      this.fieldBannerTitulo,
      this.fieldTipoBanner,
      this.fieldPeriodo,
      this.fieldStatus
    ]
  };

  showRedefinirBtn: boolean = false;

  bannerIdControl: FormControl;
  bannerSearchControl: FormControl;
  tipoBannerControl: FormControl;
  periodoControl: FormControl;
  dataInicialControl: FormControl;
  dataFinalControl: FormControl;
  statusControl: FormControl;

  minDate: Date;
  maxDate: Date = new Date();
  minInitialDate: Date;
  maxInitialDate: Date;
  erroDataFinal: boolean = false;

  @ViewChild('paginator') paginator: MatPaginator;

  items$: Observable<BannersPaginado[]>;
  banners: BannersPaginado[] = [];
  refresh$ = new Subject();
  pipe = new DatePipe('en-US');
  readonly isLoadingResults$ = new BehaviorSubject(true);

  dataSource = new MatTableDataSource(this.banners);
  totalItems = 0;

  childstate: boolean = false;

  sortListaBanners: string = '';
  init: boolean = false;
  refreshGrid: boolean = false;
  filtro: BannerFiltro;

  ngOnInit(): void {
    this.carregarBanners();
    this.carregarPeriodo();
    this.carregaTipoBanner();
    this.minInitialDate.setDate(this.minInitialDate.getDate() - 180);
  }

  ngAfterViewInit(): void {
    if (!this.childstate) {
      this.carregaGridBanners();
    }
    this.init = true;
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }

  incluirBanner() {
    this.childstate = true;
    this.router.navigate([`/configuracoes/e-contrato/gestao-banners/incluir-banner`]);
  }

  editarBanner(bannerId: number) {
    this.childstate = true;
    this.router.navigate([`/configuracoes/e-contrato/gestao-banners/editar-banner/${bannerId}`]);
  }

  formatDate(date: string) {
    let gridDate = Utility.formatGridDate(date);
    return gridDate.split(' ')[0];
  }

  inativarOuAtivarBanner(notificacaoId: number, ativo: boolean) {
    if (ativo) {
      this.configuracoesService.inativarBanner(notificacaoId).subscribe((result) => {
        if (result.errors) {
          this.notifierService.showNotification(result.errors[0].message, null, 'error');
          return;
        }

        this.notifierService.showNotification(
          'Banner inativado com sucesso.',
          'Sucesso',
          'success'
        );
        this.refresh$.next(undefined);
      });
      return;
    }

    this.configuracoesService.ativarBanner(notificacaoId).subscribe((result) => {
      if (result.errors) {
        this.notifierService.showNotification(result.errors[0].message, null, 'error');
        return;
      }

      this.notifierService.showNotification(
        'Banner ativado com sucesso.',
        'Sucesso',
        'success'
      );
      this.refresh$.next(undefined);
    });
  }

  search(event) {
    let bannerId = event.get(this.fieldBannerTitulo.id);
    let tipoBanner = event.get(this.fieldTipoBanner.id);
    let dataInicio = event.get('De');
    let dataFim = event.get('Ate');
    let status = event.get(this.fieldStatus.id);

    this.filtro = <BannerFiltro>{
      bannerId: bannerId ?? bannerId,
      tipoBanner: tipoBanner ?? tipoBanner,
      status: status ?? status,
      dataInicio: dataInicio ?? dataInicio,
      dataFim: dataFim ?? dataFim,
    };

    this.showRedefinirBtn = true;
    this.carregaGridBanners(this.filtro);
  }

  redefinir() {
    this.filtro = null;
    this.refreshGrid = !this.refreshGrid;
    this.showRedefinirBtn = false;
    this.carregaGridBanners();
    this.minInitialDate.setDate(new Date().getDate() - 180);
    this.carregaGridBanners();
  }

  setCustomControls(event: Map<string, AbstractControl>) {
    this.bannerIdControl = event.get(this.fieldBannerTitulo.id) as FormControl;
    this.bannerSearchControl = event.get(this.fieldBannerTitulo.id + '_search') as FormControl;
    this.tipoBannerControl = event.get(this.fieldTipoBanner.id) as FormControl;
    this.periodoControl = event.get(this.fieldPeriodo.id) as FormControl;
    this.dataInicialControl = event.get(this.fieldPeriodo.customFields[0].id) as FormControl;
    this.dataFinalControl = event.get(this.fieldPeriodo.customFields[1].id) as FormControl;
    this.statusControl = event.get(this.fieldStatus.id) as FormControl;
  }

  searchFilter(event: FieldOption) {
    let filtro = event.value;
    this.carregarBanners(filtro);
  }

  carregarBanners(titulo: string = null) {
    let filtro: BannerFiltro = null;
    if (titulo) { filtro = <BannerFiltro>{ titulo: titulo }; }

    this.configuracoesService.obterGestaoBannerPaginado(0, 10, filtro).subscribe(response => {
      if (response.banners) {
        let options = [];

        response.banners.forEach(banner => {
          options.push(<FieldOption>{ value: banner.id, label: banner.titulo });
        });

        this.fieldBannerTitulo.options = options;
      }
    })
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  redefinirFilterField(control: FormControl, field: FilterField) {
    control.reset();

    if (field.id == this.fieldPeriodo.id) {
      this.dataInicialControl.reset();
      this.dataFinalControl.reset();
      this.minInitialDate.setDate(new Date().getDate() - 180);
      return;
    } else {
      this.dataInicialControl.reset();
      this.dataFinalControl.reset();
      this.minInitialDate.setDate(new Date().getDate() - 180);
    }
  }

  cleanDates() {
    this.dataInicialControl.reset();
    this.dataFinalControl.reset();
  }

  onChangePeriodo(value: any, inicial: boolean) {
    this.periodoControl.reset();
    if (inicial) {
      this.setaDataMinima(value);
      return;
    }

    this.verificaData(value);
  }

  selectAll(fieldReturn: FilterFieldReturn) {
    this.selectAllOptions(this.statusControl, fieldReturn.selected, this.fieldStatus.options);
  }

  private carregaTipoBanner() {
    this.dominioService.obterPorTipo('TIPO_BANNER').subscribe(response => {
      let options = [];

      response.valorDominio.forEach(dominio => {
        options.push(<FieldOption>{ value: dominio.id, label: dominio.valor });
      });

      this.fieldTipoBanner.options = options;
    })
  }

  private carregarPeriodo() {
    this.portalDominioService.obterPorTipo('PERIODO').subscribe(
      (response: DominiosResponse) => {
        if (response.isSuccessful) {
          let options = [];

          response.valorDominio.forEach((periodo) => {
            options.push(<FieldOption>{
              value: periodo.palavraChave,
              label: periodo.valor,
            });
          });

          this.fieldPeriodo.options = options;
        }

        response.errors.forEach((error) => {
          console.info(`${error.code}-${error.message}`);
        });
      },
      (error) => console.info(error)
    );
  }

  private setaDataMinima(dataFinal: any) {
    let data1;
    data1 = Utility.formatDate(dataFinal);
    const data1Split = data1.split('-');
    this.minDate = new Date(data1Split[2], data1Split[1] - 1, data1Split[0]);
    const date = this.minDate;
    this.maxDate = new Date();
    this.maxDate.setDate(date.getDate() + 180);
  }

  private verificaData(dataFinal: any) {
    let data1;
    let data2;
    data1 = Utility.formatDate(this.dataInicialControl.value);
    data2 = Utility.formatDate(dataFinal);
    const data1Split = data1.split('-');
    const data2Split = data2.split('-');
    const novaData1 = data1Split.length > 1 ? new Date(
      data1Split[2],
      data1Split[1] - 1,
      data1Split[0]
    ) : null;
    const novaData2 = new Date(
      data2Split[2],
      data2Split[1] - 1,
      data2Split[0]
    );

    if (data1 !== '' && data2 !== '') {

      if (novaData1.getTime() <= novaData2.getTime()) {
        this.erroDataFinal = false;
      } else {
        this.erroDataFinal = true;
        this.dataFinalControl.setValue('');
      }
    }

    novaData2.setDate(novaData2.getDate() - 180);

    this.minInitialDate = novaData2;
    if (novaData1) { this.verificarDataMinima(novaData1, this.minInitialDate, this.dataInicialControl); }
  }

  private verificarDataMinima(dataInicial, minInitialDate: Date, dataInicialControl: FormControl) {
    if (dataInicial.getTime() >= minInitialDate.getTime()) {
      this.erroDataFinal = false;
    } else {
      this.erroDataFinal = true;
      dataInicialControl.setValue('');
    }
  }

  private selectAllOptions(
    control: FormControl,
    selected: boolean,
    options: FieldOption[]
  ) {
    if (selected) {
      control.patchValue([...options.map((item) => item.value), 'selectAll']);
      return;
    }

    control.patchValue([]);
  }

  private carregaGridBanners(filtro: BannerFiltro = null) {
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }

    this.items$ = merge(this.refresh$, this.paginator.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarBanners(
          this.paginator.pageIndex,
          this.paginator.pageSize,
          filtro,
          this.sortListaBanners
        );
      }),
      map((result: { totalItems: number; banners: BannersPaginado[] }) => {
        this.totalItems = result.totalItems;
        this.dataSource = new MatTableDataSource<BannersPaginado>(result.banners);
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader());

        return result.banners;
      }),
      catchError((err) => {
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader());
        return of([]);
      })
    );
  }

  private listarBanners(
    pageIndex: number = 0,
    pageSize: number = 25,
    filtro: BannerFiltro = null,
    sort = ''
  ): Observable<ObterBannersPaginadoResponse> {
    this.store.dispatch(showPreloader({ payload: '' }));

    return this.configuracoesService.obterGestaoBannerPaginado(pageIndex, pageSize, filtro, sort);
  }
}
