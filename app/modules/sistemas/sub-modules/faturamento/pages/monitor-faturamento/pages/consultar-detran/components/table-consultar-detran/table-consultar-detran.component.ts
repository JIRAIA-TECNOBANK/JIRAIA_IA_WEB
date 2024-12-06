
import { Clipboard } from '@angular/cdk/clipboard';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Sort } from '@angular/material/sort';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject, catchError, map, merge, of, startWith, switchMap } from 'rxjs';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { Documento } from 'src/app/modules/sistemas/core/models/documento.model';
import { DetranPagamentos } from 'src/app/modules/sistemas/sub-modules/faturamento/core/models/consultar-detran/detran-pagamentos.model';
import { PesquisaConsultaDetran } from 'src/app/modules/sistemas/sub-modules/faturamento/core/models/consultar-detran/pesquisa-consulta-detran.model';
import { RetornoDetran } from 'src/app/modules/sistemas/sub-modules/faturamento/core/models/consultar-detran/retorno-detran.model';
import { ConsultarDetranResponse } from 'src/app/modules/sistemas/sub-modules/faturamento/core/responses/consultar-detran/consultar-detran.response';
import { DetranService } from 'src/app/modules/sistemas/sub-modules/faturamento/services/detran.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';

@Component({
  selector: 'app-table-consultar-detran',
  templateUrl: './table-consultar-detran.component.html',
  styleUrls: ['./table-consultar-detran.component.scss']
})
export class TableConsultarDetranComponent {

  utility = Utility;
  Permissoes = Permissoes;
  documento = Documento;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Input('filtro') set setFiltro(value) {
    this.filtro = value;
    if (this.init) this.carregaGrid(value)
  }
  @Input('atualizar') set atualizar(value) {
    if (this.init) {
      this.carregaGrid();
    }
  }

  @Input('exportar') set exportar(value) {
    if (value != null) {
      this.exportarArquivos();
    }
  }

  @Output('resultado') resultado: EventEmitter<boolean> = new EventEmitter<boolean>();

  init: boolean = false;
  displayedColumns: string[] = [
    'cnpj',
    'uf',
    'mesCompetencia',
    'ano',
    'oficio',
    'boleto',
    'linhaDigitavel',
    'status',
    'acoes'
  ];

  totalItens = 0;
  items$: Observable<RetornoDetran[]>;
  refresh$ = new Subject();
  retornoDetranItens: RetornoDetran[] = [];
  dataSource = new MatTableDataSource(this.retornoDetranItens);
  copiado: boolean = false;
  sortConsultaDetran: string = null;
  filtro: PesquisaConsultaDetran = null;
  readonly isLoadingResults$ = new BehaviorSubject(true);

  constructor(private detranService: DetranService,
    private store: Store<{ preloader: IPreloaderState }>,
    private clipboard: Clipboard,
    private notifierService: NotifierService) { }

  ngAfterViewInit() {
    this.init = true;
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }

  formatDocumento() {
    return Documento.mascaraCNPJ();
  }

  baixarBoletoOficio(element: RetornoDetran) {
    this.store.dispatch(showPreloader({ payload: '' }))

    this.detranService.baixarBoletoOficio(element.idChamadaDetran).subscribe(response => {
      this.download(`data:application/x-zip;base64,${response.base64}`, response.fileName, 'zip');
      this.notifierService.showNotification('Download iniciado com sucesso!', null, 'success');
    }, error => {
      console.log(error);
      this.store.dispatch(closePreloader())
      this.notifierService.showNotification(error.message, null, 'error');
    })
  }

  retornarNomeMes(mes: number) {
    let meses = Utility.listaNomesMesas();
    return meses[mes - 1];
  }

  copiarLinhaDigitavel(linhaDigitavel: string) {
    this.clipboard.copy(linhaDigitavel);
    this.copiado = true;
    Utility.waitFor(() => { this.copiado = false; }, 3000);
  }

  sortData(sort: Sort) {
    this.sortConsultaDetran = `${sort.active}.${sort.direction}`
    this.carregaGrid(this.filtro);
  }

  isNumber(status: any): string | number {
    return isNaN(status) ? status : "Erro Protheus";
  }

  exportarArquivos() {
    this.store.dispatch(showPreloader({ payload: '' }))

    this.detranService.baixarTodosArquivos(this.filtro).subscribe(response => {
      this.notifierService.showNotification('Download iniciado com sucesso!', null, 'success');

      if (this.filtro.uf === 'SC'
        || this.filtro.uf === 'PE'
        || this.filtro.uf === 'PI'
      )
        this.download(`data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${response.base64}`, response.fileName, 'xlsx');
      else
        this.download(`data:application/x-zip;base64,${response.base64}`, response.fileName, 'zip');
    }, error => {
      this.store.dispatch(closePreloader())
      this.notifierService.showNotification('Nenhuma URL fornecido para compactar.', null, 'error');
    })
  }

  download(base64String, fileName, extensao: string) {
    const link = document.createElement('a');
    link.href = base64String;
    link.download = `${fileName}.${extensao}`;
    link.click();
    this.store.dispatch(closePreloader())
  }

  private carregaGrid(filtro: PesquisaConsultaDetran = null) {
    if (this.paginator) { this.paginator.pageIndex = 0; }

    this.items$ = merge(this.refresh$, this.paginator?.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarItens(this.paginator?.pageIndex, this.paginator?.pageSize, filtro, this.sortConsultaDetran);
      }),
      map((result: { detranPagamentosResponse: DetranPagamentos }) => {
        this.totalItens = result.detranPagamentosResponse.totalCount;
        this.dataSource = new MatTableDataSource<RetornoDetran>(result.detranPagamentosResponse.items);
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader());
        this.resultado.emit(result.detranPagamentosResponse.items?.length > 0);

        return result.detranPagamentosResponse.items;
      }),
      catchError((err) => {
        this.isLoadingResults$.next(false);
        console.info(err);
        this.totalItens = 0;
        this.store.dispatch(closePreloader())
        return of([]);
      })
    );
  }

  private listarItens(pageIndex: number = 0, pageSize: number = 25, filtro: PesquisaConsultaDetran = null, sort: string = null): Observable<ConsultarDetranResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))
    return this.detranService.consultarDetran(filtro, pageIndex, pageSize, sort);
  }
}
