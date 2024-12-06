import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { ObterLotesRequest } from '../../../../../../admin/core/requests/_portal/transacoes/obter-lotes.request';
import { ObterLotesResponse } from '../../../../../../admin/core/responses/_portal/transacoes/obter-lotes.response';
import { TransacaoService } from '../../../../../../admin/services/_portal/transacao.service';
import { ResumoLote } from '../../../../../core/models/transacoes/resumo-lote.model';

@Component({
  selector: 'app-table-lotes',
  templateUrl: './table-lotes.component.html',
  styleUrls: ['./table-lotes.component.scss']
})
export class TableLotesComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  displayedColumns = [
    'numeroLote',
    'nomeEmpresa',
    'dataSolicitacao',
    'dataProcessamento',
    'status',
    'versaoArquivo',
    'usuario',
    'tipoDoArquivo',
    'registrados',
    'acoes'
  ];
  expandedElement: ResumoLote | null;
  totalItems: number = 0;

  items$: Observable<object>;
  refresh$ = new Subject();
  readonly isLoadingResults$ = new BehaviorSubject(true);

  registrosSucesso: number;
  registrosTotal: number;
  childstate: boolean = false;
  init: boolean = false;
  protocoloLote: string;

  sortTable: string = null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Input('filtro') set setFiltroLote(value) {
    if (this.init) { this.carregarGrid(value); }
  }

  requestTransacoes: ObterLotesRequest = <ObterLotesRequest>{
    empresaId: "",
    dominioId: "",
    statusTransacao: "",
    dataInicio: null,
    dataFim: null,
    protocoloLote: null,
    sort: null
  };

  loading: boolean = true;

  @Input('refreshGrid') set onRefreshGrid(value) { if (this.init) this.carregarGrid(); }

  @Input('refresh') set refreshGrid(value) { this.refresh$.next(undefined); }

  @Output('closePreloader') closePreloader: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(public dialog: MatDialog,
    private transacaoService: TransacaoService,
    private notifierService: NotifierService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private store: Store<{ preloader: IPreloaderState }>) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) {
        this.childstate = val['url'].split('enviar-lote')[1]?.includes('consultar-registro');
        this.protocoloLote = this.activatedRoute.snapshot.params['protocoloLote'];
      }
    });
  }

  ngOnInit(): void {
    //
  }

  ngAfterViewInit() {
    this.carregarGrid();
    this.init = true;
  }

  carregarGrid(filtros = null) {
    if (this.paginator) { this.paginator.pageIndex = 0; }

    this.items$ = merge(this.refresh$, this.paginator?.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults$.next(true)
          return this.obterResumoLotes(filtros, this.paginator?.pageIndex, this.paginator?.pageSize)
        }),
        map((result: { lotes: ResumoLote[], totalItems: number }) => {
          this.totalItems = result.totalItems
          this.isLoadingResults$.next(false);
          this.closePreloader.emit(true);
          this.loading = false;
          return result.lotes
        }),
        catchError((err) => {
          this.isLoadingResults$.next(false)
          console.info(err)
          return of([])
        })
      )
  }

  tratarFiltros(filtros) {
    if (filtros) {
      const novoFiltro = <ObterLotesRequest>{
        empresaId: filtros.get('empresaId') ? filtros.get('empresaId').map(d => d).join(',') : '',
        dominioId: filtros.get('dominioId') ? filtros.get('dominioId').map(d => d).join(',') : '',
        statusTransacao: filtros.get('statusTransacao') ? filtros.get('statusTransacao').map(d => d).join(',') : '',
        protocoloLote: filtros.get('protocoloLote') ? filtros.get('protocoloLote') : null,
        dataInicio: filtros.get('loteDataInicio'),
        dataFim: filtros.get('loteDataFim'),
        sort: this.sortTable,
      }

      return novoFiltro;
    }

    return <ObterLotesRequest>{ empresaId: "", dominioId: "", statusTransacao: "", dataInicio: null, dataFim: null, protocoloLote: null, sort: this.sortTable };
  }

  private obterResumoLotes(filtros, pageIndex: number, pageSize: number): Observable<ObterLotesResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))
    const novoFiltro = this.tratarFiltros(filtros);
    return this.transacaoService.obterLotes(novoFiltro, pageIndex, pageSize)
  }

  getRegistrosSucesso(registrados: string) {
    return +registrados.split('/')[0];
  }

  getRegistrosTotal(registrados: string) {
    return +registrados.split('/')[1];
  }

  getInconsistencias(registrados: string) {
    let inconsistencias = this.getRegistrosTotal(registrados) - this.getRegistrosSucesso(registrados);
    if (inconsistencias == 0) return '';

    return `${inconsistencias} inconsistência${inconsistencias > 1 ? 's' : ''}`;
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(<TipoElemento>tipoElemento, nomeElemento, guidElemento);
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }

  goToConsulta(protocoloLote: string) {
    let rota = "";
    if (this.protocoloLote) { rota = `../../monitor-operacoes-lotes`; }
    else { rota = `../monitor-operacoes-lotes`; }
    this.router.navigate([rota, protocoloLote], { relativeTo: this.activatedRoute });
  }

  sortData(sort: Sort) {
    this.sortTable = `${sort.active}.${sort.direction}`
    this.carregarGrid();
  }

  onClickDownload(numeroLote) {
    this.transacaoService.obterLote(numeroLote).toPromise()
      .then(response => {
        this.downloadArquivo(response.url, response.nomeArquivo);
      })
  }

  onClickDownloadRetorno(numeroLote, tipo) {
    this.transacaoService.obterLoteBase64(numeroLote, tipo).toPromise()
      .then(response => {
        let mimeType = '';
        if (tipo == 'CSV') {
          mimeType = 'text/csv';
        } else {
          mimeType = 'text/plain';
        }

        let arquivoBase64 = `data:${mimeType};base64,${response.loteBase64}`;
        this.downloadArquivo(arquivoBase64, response.nomeArquivo);
      })
      .catch(error => {
        this.notifierService.showNotification(error.error.errors[0].message, 'Erro', 'error');
      })
  }

  downloadArquivo(file, nomeArquivo) {
    var element = document.createElement('a');
    element.setAttribute('download', nomeArquivo);
    element.setAttribute('href', file)
    document.body.appendChild(element);
    element.click();
  }

}
