import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatSort, Sort } from '@angular/material/sort';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { BehaviorSubject, merge, Observable, of, Subject } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { PortalRelatoriosService } from 'src/app/modules/sistemas/sub-modules/admin/services/_portal/relatorio.service';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { DialogEnviarEmailComponent } from 'src/app/shared/components/dialog-enviar-email/dialog-enviar-email.component';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';
import {
  closePreloader,
  showPreloader,
} from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { RelatoriosFiltro } from '../../../../core/models/relatorios/relatorios-filtro.model';
import { Relatorios } from '../../core/models/relatorios/relatorios-model';
import { EmitirRelatorioEmailRequest } from '../../core/requests/emitir-relatorio-email.request';
import { ObterRelatoriosResponse } from '../../core/responses/obter-relatorios.response';

@Component({
  selector: 'app-table-relatorios-gerados',
  templateUrl: './table-relatorios-gerados.component.html',
  styleUrls: ['./table-relatorios-gerados.component.scss'],
})
export class TableRelatoriosGeradosComponent implements OnInit {

  utility = Utility;

  @Input('refreshGrid') set setRefreshGrid(value) { if (this.init) { this.refresh$.next(undefined); } }

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Input('filtro') set setFiltro(value) {
    if (this.init) this.carregaGridRelatorios(value)
  }

  init: boolean = false;

  items$: Observable<Relatorios[]>;
  relatorios: Relatorios[] = [];
  sortListaRelatorios: string = '';

  dataSource = new MatTableDataSource(this.relatorios);
  refresh$ = new Subject();
  totalItems = 0;

  readonly isLoadingResults$ = new BehaviorSubject(true);

  displayedColumns: string[] = [
    'empresa',
    'nome',
    'tipo',
    'dataInicio',
    'dataFinal',
    'solicitadoPor',
    'dataSolicitacao',
    'status',
    'acoes',
  ];

  constructor(
    private dialog: MatDialog,
    private relatoriosService: PortalRelatoriosService,
    private store: Store<{ preloader: IPreloaderState }>,
    private dialogService: DialogCustomService,
    private notifierService: NotifierService
  ) { }

  refreshGrid: boolean = false;
  empresaId: number = null;
  emailUsuarios: string[] = [];

  ngOnInit(): void {
    this.dialogService.dialogData$.subscribe(response => {
      if (response.dataType == 'relatorios-email') {
        this.empresaId = response.data.empresaId;
        this.emailUsuarios = response.data.usuarios;
      }
    });
  }

  ngAfterViewInit() {
    this.carregaGridRelatorios();
    this.init = true;
  }

  carregaGridRelatorios(filtros: RelatoriosFiltro = null) {
    if(this.paginator) this.paginator.pageIndex = 0;
    
    this.items$ = merge(this.refresh$, this.paginator.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarRelatorios(
          this.paginator.pageIndex,
          this.paginator.pageSize,
          filtros
        );
      }),
      map((result: { totalItems: number; relatorios: Relatorios[] }) => {
        this.totalItems = result.totalItems;
        this.dataSource = new MatTableDataSource<Relatorios>(result.relatorios);
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader());

        return result.relatorios;
      }),
      catchError((err) => {
        this.isLoadingResults$.next(false);
        console.info(err);
        this.store.dispatch(closePreloader());
        return of([]);
      })
    );
  }

  listarRelatorios(pageIndex: number = 0, pageSize: number = 25, filtros: RelatoriosFiltro = null): Observable<ObterRelatoriosResponse> {
    if (pageIndex == 0)
      pageIndex = 1

    if (filtros == null) filtros = new RelatoriosFiltro();
    filtros.sort = this.sortListaRelatorios;

    this.store.dispatch(showPreloader({ payload: '' }))
    return this.relatoriosService.obterRelatorios(pageIndex, pageSize, filtros);
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }

  baixarRelatorio(url) {
    if (url) {
      window.open(url, '_blank').focus();
    }
  }

  openDialogEnviarRelatorios(protocolo: string, empresaId: string) {
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'solicitar-relatorio'),
      width: '516px',
      data: {
        component: DialogEnviarEmailComponent,
        title: '',
        empresaId: +empresaId,
        texto: 'o relatório',
        buttonCancel: {
          value: false,
          text: 'Cancelar',
        },
        buttonConfirm: {
          value: true,
          text: 'Enviar',
        },
        disableSaveWithoutData: true,
      },
    });

    dialogRef.afterClosed().subscribe(confirmacao => {
      if (confirmacao) {
        let request: EmitirRelatorioEmailRequest = {
          protocolo: protocolo,
          emails: this.emailUsuarios
        };

        this.store.dispatch(showPreloader({ payload: '' }));

        this.emitirRelatorioEmail(request);
      }
    })
  }

  sortData(sort: Sort) {
    switch (sort.active) {
      case 'TituloEmpresa':
        this.sortListaRelatorios = `nomeEmpresa.${sort.direction}`;
        break;
      case 'TituloNome':
        this.sortListaRelatorios = `nome.${sort.direction}`;
        break;

      case 'TituloTipo':
        this.sortListaRelatorios = `tipoArquivo.${sort.direction}`;
        break;

      case 'dataInicio':
        this.sortListaRelatorios = `dataInicio.${sort.direction}`;
        break;

      case 'dataFinal':
        this.sortListaRelatorios = `dataFinal.${sort.direction}`;
        break;

      case 'TituloDataSolicitacao':
        this.sortListaRelatorios = `dataSolicitacao.${sort.direction}`;
        break;

      case 'TituloStatus':
        this.sortListaRelatorios = `status.${sort.direction}`;
        break;

      default:
        this.sortListaRelatorios = `${sort.active}.${sort.direction}`;
        break;
    }

    this.listarRelatorios(0, 5);
    this.refresh$.next(undefined);
  }

  formatDate(date: string) {
    if (!date) {
      return null;
    }

    return moment(date).format('DD/MM/YYYY[\r\n]HH:mm');
  }

  private emitirRelatorioEmail(request: EmitirRelatorioEmailRequest) {
    this.relatoriosService.emitirRelatorioEmail(request).subscribe(response => {
      this.store.dispatch(closePreloader());

      if (response.protocolo) {
        this.notifierService.showNotification('Relatório enviado com sucesso!', '', 'success');
        return;
      }

      this.notifierService.showNotification(response.errors[0].message, '', 'error');
    })
  }

  
  formatJustDate(date: string) {
    if (!date) {
      return null;
    }
 
    return moment(date).format('DD/MM/YYYY');
  }
}
