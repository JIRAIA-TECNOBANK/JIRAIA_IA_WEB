import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { Utility } from 'src/app/core/common/utility';
import { FiltroNormativos, Normativo } from '../../../../core/model/normativos.model';
import { BehaviorSubject, Observable, Subject, catchError, delay, map, merge, of, startWith, switchMap } from 'rxjs';
import { Store } from '@ngrx/store';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { ObterListaNormativoResponse } from '../../../../core/responses/obter-lista-normativos.response';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { NormativosService } from '../../../../services/normativos.service';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { DialogConfirmationComponent } from '../dialog-confirmation/dialog-confirmation.component';

@Component({
  selector: 'app-table-normativos',
  templateUrl: './table-normativos.component.html',
  styleUrls: ['./table-normativos.component.scss'],
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
export class TableNormativosComponent implements AfterViewInit {
  utility = Utility;

  displayedColumnsNormativos: string[] = [
    'uf',
    'nomePortaria',
    'dataVigencia',
    'dataCriacao',
    'tipo',
    'tipoRegistro',
    'nacional',
    'status',
  ];

  columnsToDisplayWithExpand = [...this.displayedColumnsNormativos, 'expand'];

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  @Input('refreshGrid') set setRefreshGrid(value) { if (this.init) this.carregarGridNormativos(); }

  @Input('filtro') set setFiltro(value) {
    if (this.init) this.carregarGridNormativos(value)
  }

  init: boolean = false;

  items$: Observable<Normativo[]>;
  normativos: Normativo[] = [];
  expandedElement: Normativo | null;
  filtroNormativos: FiltroNormativos = null;

  dataSource = new MatTableDataSource(this.normativos);
  refresh$ = new Subject();
  totalItems = 0;

  readonly isLoadingResults$ = new BehaviorSubject(true);

  constructor(
    private store: Store<{ preloader: IPreloaderState }>, 
    private normativosService: NormativosService,
    private notifierService: NotifierService,
    private dialog: MatDialog,) { }

  ngAfterViewInit() {
    this.carregarGridNormativos();
    this.init = true;
  }

  expandDetail(element: Normativo, close: boolean) {
    if (close) {
      this.expandedElement = element;
    } else {
      this.expandedElement = null;
    }
  }

  carregarGridNormativos(filtros: FiltroNormativos = null) {
    this.filtroNormativos = filtros;
    
    if (this.paginator) this.paginator.pageIndex = 0;

    this.items$ = merge(this.refresh$, this.paginator.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);

        return this.listarNormativos(
          this.paginator.pageIndex,
          this.paginator.pageSize,
          filtros,
        );
      }),
      map((result: any) => {
        this.totalItems = result.result.totalItems;
        this.dataSource = new MatTableDataSource<Normativo>(result.result.normativos);
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader());

        return result.result.normativos;
      }),
      catchError((err) => {
        this.isLoadingResults$.next(false);
        console.info(err);
        this.store.dispatch(closePreloader());
        return of([]);
      })
    );
  }

  listarNormativos(pageIndex: number = 0, pageSize: number = 25, filtros: FiltroNormativos = null): Observable<ObterListaNormativoResponse> {
    
    if (filtros == null) filtros = new FiltroNormativos();

    this.store.dispatch(showPreloader({ payload: 'Carregando normativos...' }));

    return this.normativosService.obterListaNormativo(pageIndex, pageSize, filtros);
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }

  downloadNormativo(normativo: Normativo) {
    this.store.dispatch(showPreloader({ payload: 'Preparando download...' }));

    this.normativosService
      .downloadNormativo(normativo.id)
      .subscribe({
        next: (resp) => {
          const downloadLink = document.createElement('a');
          const url = window.URL.createObjectURL(resp);
          downloadLink.href = url;
          downloadLink.download = normativo.nomeArquivo;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(url);
        },
        complete: () => {
          this.store.dispatch(closePreloader());
        },
      });
  }

  arquivarNormativo(normativo: Normativo, title: string) {

    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: DialogConfirmationComponent,
        title: `${title} normativo`,
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
        this.store.dispatch(showPreloader({ payload: `${title === 'Arquivar' ? 'Arquivando' : 'Ativando'} normativo...` }));
    
        this.normativosService
          .arquivarNormativo(normativo.id)
          .subscribe({
            next: (resp) => {
              this.carregarGridNormativos(this.filtroNormativos);
              this.notifierService.showNotification(`${title === 'Arquivar' ? 'Arquivado' : 'Ativado'} com sucesso.`, 'Sucesso', "success");
            },
            error: (err) => {
              this.notifierService.showNotification(`Erro ao ${title === 'Arquivar' ? 'arquivar' : 'ativar'}, ${err.error}.`, 'Erro', "error");
              this.store.dispatch(closePreloader());
            },
            complete: () => {
              this.store.dispatch(closePreloader());
            },
          });
        }
    })

  }

  deletarNormativo(normativo: Normativo) {

    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: DialogConfirmationComponent,
        title: 'Deletar normativo',
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
        this.store.dispatch(showPreloader({ payload: 'Deletando normativo...' }));
    
        this.normativosService
          .deletarNormativo(normativo.id)
          .subscribe({
            next: (resp) => {
              this.carregarGridNormativos(this.filtroNormativos);
              this.notifierService.showNotification('Deletado com sucesso.', 'Sucesso', "success")
            },
            error: (err) => {
              this.notifierService.showNotification(`Erro ao deletar, ${err.error}.`, 'Erro', "error");
              this.store.dispatch(closePreloader());
            },
            complete: () => {
              this.store.dispatch(closePreloader());
            },
          });
        }
    })

  }
}
