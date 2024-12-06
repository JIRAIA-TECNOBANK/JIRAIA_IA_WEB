import { Component, Input, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { BehaviorSubject, Observable, Subject, catchError, map, merge, of, startWith, switchMap } from 'rxjs';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { Store } from '@ngrx/store';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { Utility } from 'src/app/core/common/utility';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { DialogConfirmationComponent } from '../../../../normativos/components/dialog-confirmation/dialog-confirmation.component';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { InstituicaoFinanceiraService } from '../../../../../services/instituicao-financeira.service';
import { Instituicao } from '../../../../../core/model/instituicao-financeira.model';
import { ObterListaInstituicaoFinanceiraResponse } from '../../../../../core/responses/obter-lista-instituicaoFinanceira.response';

@Component({
  selector: 'app-table-instituicao',
  templateUrl: './table-instituicao.component.html',
  styleUrls: ['./table-instituicao.component.scss']
})
export class TableInstituicaoComponent {
  utility = Utility;
  totalItems = 0;

  items$: Observable<any[]>;
  refresh$ = new Subject();
  filtroInstituicao: any = null;

  instituicao: Instituicao[] = [];
  dataSource = new MatTableDataSource(this.instituicao);
  init: boolean = false;
  readonly isLoadingResults$ = new BehaviorSubject(true);

  displayedColumns: string[] = [
    'uf',
    'precoCadastro',
    'precoRenovacao',
    'periodicidade',
    'opcoes',
  ];

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  
  @Input('refreshGrid') set setRefreshGrid(value) { 
    if (this.init) {
      this.carregarGridInstituicao();
    } 
  }

  constructor(
    private store: Store<{ preloader: IPreloaderState }>,
    private instituicaoService: InstituicaoFinanceiraService,
    private dialog: MatDialog,
    private notifierService: NotifierService
  ){}

  ngAfterViewInit() {
    this.carregarGridInstituicao();
    this.init = true;
  }

  carregarGridInstituicao(filtros: any = null) {
    this.filtroInstituicao = filtros;

    if (this.paginator){ 
      this.paginator.pageIndex = 0;
    }

    this.items$ = merge(this.refresh$, this.paginator.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);

        return this.listarInstituicao(
          this.paginator.pageIndex,
          this.paginator.pageSize,
          filtros
        );
      }),
      map((result: ObterListaInstituicaoFinanceiraResponse) => {
        this.totalItems = result.result.totalItems;
        
        this.dataSource = new MatTableDataSource<Instituicao>(result.result.instituicoesFinanceiras);
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader());

        return result.result.instituicoesFinanceiras;
      }),
      catchError((err) => {
        this.isLoadingResults$.next(false);
        console.info(err);
        this.store.dispatch(closePreloader());
        return of([]);
      })
    );
  }

  listarInstituicao(pageIndex: number = 0, pageSize: number = 25, filtros: any = null): Observable<ObterListaInstituicaoFinanceiraResponse> {
    this.store.dispatch(showPreloader({ payload: 'Carregando instituicao...' }));
    return this.instituicaoService.obterListaInstituicaoFinanceira(pageIndex, pageSize, filtros);
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }

  deletarInstituicao(instituicao: Instituicao){
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: DialogConfirmationComponent,
        title: 'Deletar instituição financeira',
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
        this.store.dispatch(showPreloader({ payload: 'Deletando instituição financeira...' }));

        this.instituicaoService.deletarInstituicao(instituicao.id)
        .subscribe({
          next: (resp) => {
            this.carregarGridInstituicao(null);
            this.notifierService.showNotification('Deletada com sucesso.', 'Sucesso', "success")
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
