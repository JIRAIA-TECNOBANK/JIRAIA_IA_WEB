import { DatePipe, registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';
import { Component, EventEmitter, Input, LOCALE_ID, OnInit, Output, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject, merge, of, zip } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { Taxas } from 'src/app/modules/sistemas/sub-modules/faturamento/core/models/taxa/taxas.model';
import { ObterPrecosVigentesResponse } from 'src/app/modules/sistemas/sub-modules/faturamento/core/responses/preco/obter-precos-vigentes.response';
import { ObterTaxasVigentesResponse } from 'src/app/modules/sistemas/sub-modules/faturamento/core/responses/taxa/obter-taxas-vigentes.response';
import { PrecoService } from 'src/app/modules/sistemas/sub-modules/faturamento/services/preco.service';
import { TaxaService } from 'src/app/modules/sistemas/sub-modules/faturamento/services/taxa.service';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { GestaoDetransPaginado } from '../../../_core/models/gestao-detrans-paginado.model';
import { ObterDetransPaginadoResponse } from '../../../_core/responses/gestao-detran/obter-detrans-paginado.response';
import { GestaoDetransService } from '../../../_core/services/gestao-detrans.service';
import { DialogInativarDetranComponent } from '../dialog-inativar-detran/dialog-inativar-detran.component';

registerLocaleData(ptBr);

@Component({
  selector: 'app-table-gestao-detrans',
  templateUrl: './table-gestao-detrans.component.html',
  styleUrls: ['./table-gestao-detrans.component.scss'],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt' },
  ],
})
export class TableGestaoDetransComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  constructor(
    private gestaoDetransService: GestaoDetransService,
    private store: Store<{ preloader: IPreloaderState }>,
    private router: Router,
    private notifierService: NotifierService,
    public dialog: MatDialog,
    private taxaService: TaxaService,
    private precoService: PrecoService,
    private activatedRoute: ActivatedRoute
  ) {
  }

  @ViewChild('paginator') paginator: MatPaginator;
  @Input('atualizarGrid') set atualizarGrid(value) {
    if (this.init) { this.carregaGrid(); }
  }
  @Output('onEditar') onEditar: EventEmitter<boolean> = new EventEmitter<boolean>();

  displayedColumns: string[] = [
    'uf',
    'tipoPreco',
    'taxaDetran',
    'precoTbk',
    'status',
    'acoes'
  ];

  items$: Observable<GestaoDetransPaginado[]>;
  detrans: GestaoDetransPaginado[] = [];
  refresh$ = new Subject();
  pipe = new DatePipe('en-US');
  readonly isLoadingResults$ = new BehaviorSubject(true);

  dataSource = new MatTableDataSource(this.detrans);
  totalItems = 0;
  init: boolean = false;
  totalRegistros: number;

  taxasVigentes: Taxas[] = [];

  ngOnInit(): void {
    //
  }

  ngAfterViewInit() {
    this.carregaGrid();
    this.init = true;
  }

  carregaGrid() {
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }

    this.items$ = merge(this.refresh$, this.paginator.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);

        return zip(this.listarDetrans(), this.listarTaxasVigentes(), this.listarPrecosVigentes());
      }),
      map((result) => {
        this.totalItems = result[0].tempoInatividadeDetran.length;
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader());

        return this.mergeByUF(result[0].tempoInatividadeDetran, result[1].taxas, result[2].precoTecnobank);
      }),
      catchError((err) => {
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader());
        return of([]);
      })
    );
  }

  mergeByUF = (detrans, taxasDetran, precosTbk) =>
    detrans.map(itm => ({
      taxaDetran: taxasDetran.find((item) => (item.uf === itm.uf) && item),
      precoTbk: precosTbk.find((item) => (item.uf === itm.uf) && item),
      ...itm
    }));

  listarDetrans(
    pageIndex: number = 0,
    pageSize: number = 25,
    sort = ''
  ): Observable<ObterDetransPaginadoResponse> {
    this.store.dispatch(showPreloader({ payload: '' }));

    return this.gestaoDetransService.obterDetransPaginado();
  }

  listarTaxasVigentes(): Observable<ObterTaxasVigentesResponse> {
    return this.taxaService.obterTaxasVigentes();
  }

  listarPrecosVigentes(): Observable<ObterPrecosVigentesResponse> {
    return this.precoService.obterPrecosVigentes();
  }

  retornarTaxaVigente(uf: string) {
    return this.taxasVigentes.filter(t => t.uf === uf)[0]?.valorTaxa;
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }

  formatDate(date: string) {
    if (date) {
      let gridDate = Utility.formatGridDate(date);
      return gridDate.split(' ')[0];
    }

    return '-'
  }

  editarDetran(id: number) {
    this.onEditar.emit(true);
    this.router.navigate([`/gestao-detrans/editar-detran/${id}`]);
  }

  clickAtivarInativarDetran(id: number, ativo: boolean) {
    if (!Utility.getPermission([Permissoes.GESTAO_FINANCEIRO_PRECO_CADASTRAR, Permissoes.GESTAO_FINANCEIRO_APROVACAO_PRECO_TECNOBANK])) return;

    if (ativo) {
      const dialogRef = this.dialog.open(DialogCustomComponent, {
        width: '500px',
        data: {
          component: DialogInativarDetranComponent,
          buttonCancel: {
            value: false,
            text: 'Cancelar',
          },
          buttonConfirm: {
            value: true,
            text: 'Confirmar',
          },
          disableSaveWithoutData: true
        },
      });

      dialogRef.afterClosed().subscribe(confirmacao => {
        if (confirmacao) {
          this.ativarInativar(id, ativo);
        }
      })

      return;
    }

    this.ativarInativar(id, ativo);
  }

  ativarInativar(id: number, ativo: boolean) {
    this.store.dispatch(showPreloader({ payload: '' }));

    this.gestaoDetransService.ativarInativarDetran(id).subscribe(response => {
      this.carregaGrid();
      this.store.dispatch(closePreloader());

      if (response.id) {
        let mensagem = ativo ? 'DETRAN inativado com sucesso!' : 'DETRAN ativado com sucesso!';
        this.notifierService.showNotification(mensagem, '', 'success');
        return;
      }

      this.notifierService.showNotification(response.errors[0].message, '', 'error');
    })
  }

  retornarTipoPreco(tipoPreco: number = null) {
    if (tipoPreco === null) return '-';
    if (tipoPreco === 1) { return 'Público'; }
    return 'Privado';
  }

}
