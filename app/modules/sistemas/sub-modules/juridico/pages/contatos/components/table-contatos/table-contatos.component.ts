import { Component, Input, ViewChild } from '@angular/core'
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator'
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { BehaviorSubject, Observable, Subject, catchError, map, merge, of, startWith, switchMap } from 'rxjs'
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions'
import { Store } from '@ngrx/store'
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer'
import { ObterListaContatosResponse } from '../../../../core/responses/obter-lista-contatos.response'
import { Utility } from 'src/app/core/common/utility'
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component'
import { DialogConfirmationComponent } from '../../../normativos/components/dialog-confirmation/dialog-confirmation.component'
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service'
import { Contato } from '../../../../core/model/contato.model'
import { FiltroContatos } from '../../../../core/model/filtro-contatos.model'
import { ContatosService } from '../../../../services/contatos.service'

@Component({
  selector: 'app-table-contatos',
  templateUrl: './table-contatos.component.html',
  styleUrls: ['./table-contatos.component.scss']
})
export class TableContatosComponent {
  utility = Utility

  displayedColumns: string[] = [
    'uf',
    'nome',
    'orgao',
    'cargo',
    'opcoes',
  ]
  
  @Input('refreshGrid') set setRefreshGrid(value) { 
    if (this.init) this.carregarGridContatos() 
  }

  @Input('filtro') set setFiltro(value) {
    if (this.init) this.carregarGridContatos(value)
  }

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator

  init: boolean = false
  
  items$: Observable<any[]>
  contatos: Contato[] = []
  filtroContatos: FiltroContatos = null
  
  dataSource = new MatTableDataSource(this.contatos)
  totalItems = 0
  refresh$ = new Subject()

  readonly isLoadingResults$ = new BehaviorSubject(true)

  constructor(
    private store: Store<{ preloader: IPreloaderState }>, 
    private contatosService: ContatosService,
    private dialog: MatDialog,
    private notifierService: NotifierService
  ){}

  ngAfterViewInit() {
    this.carregarGridContatos()
    this.init = true
  }

  carregarGridContatos(filtros: FiltroContatos = null) {
    this.filtroContatos = filtros

    if (this.paginator) {
      this.paginator.pageIndex = 0
    }

    this.items$ = merge(this.refresh$, this.paginator.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true)

        return this.listarContatos(
          this.paginator.pageIndex,
          this.paginator.pageSize,
          filtros
        )
      }),
      map((result: ObterListaContatosResponse) => {
        this.totalItems = result.result.totalItems
        this.dataSource = new MatTableDataSource<Contato>(result.result.contatos)
        this.isLoadingResults$.next(false)
        this.store.dispatch(closePreloader())

        return result.result.contatos
      }),
      catchError((err) => {
        this.isLoadingResults$.next(false)
        console.info(err)
        this.store.dispatch(closePreloader())

        return of([])
      })
    )
  }

  listarContatos(
    pageIndex: number = 0, 
    pageSize: number = 25, 
    filtros: FiltroContatos = null
  ): Observable<ObterListaContatosResponse> {
    if (filtros == null) {
      filtros = new FiltroContatos()
    }
    
    this.store.dispatch(showPreloader({ payload: 'Carregando contatos...' }))
    return this.contatosService.obterListaContatos(pageIndex, pageSize, filtros)
  }

  deletarContato(contato: Contato){
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: DialogConfirmationComponent,
        title: 'Deletar contato',
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
    })

    dialogRef.afterClosed().subscribe(confirmacao => {
      if (confirmacao) {
        this.store.dispatch(showPreloader({ payload: 'Deletando contato...' }))

        this.contatosService.deletarContato(contato.id)
        .subscribe({
          next: (resp) => {
            this.carregarGridContatos(null)

            this.notifierService.showNotification(
              'Deletado com sucesso.', 
              'Sucesso', 
              "success"
            )
          },
          error: (err) => {
            this.notifierService.showNotification(
              `Erro ao deletar, 
              ${err.error}.`, 
              'Erro', 
              "error"
            )

            this.store.dispatch(closePreloader())
          },
          complete: () => {
            this.store.dispatch(closePreloader())
          },
        })
      }
    })

  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex
    this.paginator.pageSize = event.pageSize
    this.paginator.page.emit(event)
  }
}
