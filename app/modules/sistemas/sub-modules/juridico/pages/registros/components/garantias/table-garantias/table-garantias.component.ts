import { Component, Input, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { Store } from '@ngrx/store';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { GarantiasService } from '../../../../../services/garantias.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { BehaviorSubject, Observable, Subject, catchError, map, merge, of, startWith, switchMap } from 'rxjs';
import { Registro } from '../../../../../core/model/registro.model';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { ObterListaGarantiasResponse } from '../../../../../core/responses/obter-lista-garantias.response';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { DialogConfirmationComponent } from '../../../../normativos/components/dialog-confirmation/dialog-confirmation.component';
import { Utility } from 'src/app/core/common/utility';
import { FiltroGarantiasRegistros } from '../../../../../core/model/filtro-garantias-registros.model';

@Component({
  selector: 'app-table-garantias',
  templateUrl: './table-garantias.component.html',
  styleUrls: ['./table-garantias.component.scss']
})
export class TableGarantiasComponent {
  utility = Utility;
  
  displayedColumns: string[] = [
    'uf',
    'tipoRegistro',
    'valorRegistradora',
    'valorPublico',
    'valorTotal',
    'opcoes',
  ];
  

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  
  @Input('refreshGrid') set setRefreshGrid(value) { if (this.init) this.carregarGridRegistros(); }

  @Input('filtro') set setFiltro(value) {
    if (this.init) this.carregarGridRegistros(value)
  }

  init: boolean = false;

  items$: Observable<any[]>;
  garantias: Registro[] = [];
  filtroGarantias: any = null;

  dataSource = new MatTableDataSource(this.garantias);
  refresh$ = new Subject();
  totalItems = 0;

  readonly isLoadingResults$ = new BehaviorSubject(true);

  constructor(
    private store: Store<{ preloader: IPreloaderState }>, 
    private garantiasService: GarantiasService,
    private dialog: MatDialog,
    private notifierService: NotifierService
  ){}

  ngAfterViewInit() {
    this.carregarGridRegistros();
    this.init = true;
  }

  carregarGridRegistros(filtros: FiltroGarantiasRegistros = null) {
    this.filtroGarantias = filtros;

    if (this.paginator) this.paginator.pageIndex = 0;

    this.items$ = merge(this.refresh$, this.paginator.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);

        return this.listarRegistros(
          this.paginator.pageIndex,
          this.paginator.pageSize,
          filtros
        );
      }),
      map((result: ObterListaGarantiasResponse) => {
        this.totalItems = result.result.totalItems; 
        this.dataSource = new MatTableDataSource<Registro>(result.result.garantias);
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader());
        return result.result.garantias;
      }),
      catchError((err) => {
        this.isLoadingResults$.next(false);
        console.info(err);
        this.store.dispatch(closePreloader());
        return of([]);
      })
    );
  }

  listarRegistros(pageIndex: number = 0, pageSize: number = 25, filtros: FiltroGarantiasRegistros = null): Observable<ObterListaGarantiasResponse> {
    if (filtros == null) filtros = new FiltroGarantiasRegistros();

    this.store.dispatch(showPreloader({ payload: 'Carregando garantias...' }));

    return this.garantiasService.obterListaGarantias(pageIndex, pageSize, filtros);
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }

  deletarGarantia(registro: Registro){

    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: DialogConfirmationComponent,
        title: 'Deletar garantia',
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
        this.store.dispatch(showPreloader({ payload: 'Deletando garantia...' }));

        this.garantiasService
        .deletarGarantia(registro.id)
        .subscribe({
          next: (resp) => {
            this.carregarGridRegistros(null);
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
