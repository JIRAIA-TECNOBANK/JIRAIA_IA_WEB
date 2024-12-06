import { Component, Input, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { BehaviorSubject, Observable, Subject, catchError, map, merge, of, startWith, switchMap } from 'rxjs';
import { Registro } from '../../../../../core/model/registro.model';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { Store } from '@ngrx/store';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { ObterListaRegistrosResponse } from '../../../../../core/responses/obter-lista-registros.response';
import { RegistrosService } from '../../../../../services/registros.service';
import { Utility } from 'src/app/core/common/utility';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { DialogConfirmationComponent } from '../../../../normativos/components/dialog-confirmation/dialog-confirmation.component';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { FiltroGarantiasRegistros } from '../../../../../core/model/filtro-garantias-registros.model';

@Component({
  selector: 'app-table-registros',
  templateUrl: './table-registros.component.html',
  styleUrls: ['./table-registros.component.scss']
})
export class TableRegistrosComponent {
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

  totalItems = 0;
  items$: Observable<any[]>;
  refresh$ = new Subject();
  filtroRegistros: any = null;
  registros: Registro[] = [];
  dataSource = new MatTableDataSource(this.registros);
  init: boolean = false;

  readonly isLoadingResults$ = new BehaviorSubject(true);

  constructor(
    private store: Store<{ preloader: IPreloaderState }>, 
    private registrosService: RegistrosService,
    private dialog: MatDialog,
    private notifierService: NotifierService
  ){}

  ngAfterViewInit() {
    this.carregarGridRegistros();
    this.init = true;
  }

  carregarGridRegistros(filtros: FiltroGarantiasRegistros = null) {
    this.filtroRegistros = filtros;

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
      map((result: ObterListaRegistrosResponse) => {
        this.totalItems = result.result.totalItems;
        this.dataSource = new MatTableDataSource<Registro>(result.result.registros);
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader());

        return result.result.registros;
      }),
      catchError((err) => {
        this.isLoadingResults$.next(false);
        console.info(err);
        this.store.dispatch(closePreloader());
        return of([]);
      })
    );
  }

  listarRegistros(pageIndex: number = 0, pageSize: number = 25, filtros: any = null): Observable<ObterListaRegistrosResponse> {
    if (filtros == null) filtros = new FiltroGarantiasRegistros();
    
    this.store.dispatch(showPreloader({ payload: 'Carregando registros...' }));

    return this.registrosService.obterListaRegistros(pageIndex, pageSize, filtros);
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }

  deletarRegistro(registro: Registro){

    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: DialogConfirmationComponent,
        title: 'Deletar registro',
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
        this.store.dispatch(showPreloader({ payload: 'Deletando registro...' }));

        this.registrosService
        .deletarRegistro(registro.id)
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
