import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Store } from '@ngrx/store';
import { Observable, Subject, catchError, map, merge, of, startWith, switchMap } from 'rxjs';
import { Utility } from 'src/app/core/common/utility';
import { Cor } from 'src/app/modules/sistemas/sub-modules/crm/core/models/veiculos/cor.model';
import { CoresFiltro } from 'src/app/modules/sistemas/sub-modules/crm/core/models/veiculos/cores-filtro.model';
import { ObterCoresResponse } from 'src/app/modules/sistemas/sub-modules/crm/core/responses/veiculo/obter-cores.response';
import { VeiculoService } from 'src/app/modules/sistemas/sub-modules/crm/services/veiculo.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { IInfoLoadingState } from 'src/app/shared/store/info-loading/info-loading.reducer';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { DialogAdicionarCorComponent } from '../dialog-adicionar-cor/dialog-adicionar-cor.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';

@Component({
  selector: 'app-tabela-cores',
  templateUrl: './tabela-cores.component.html',
  styleUrls: ['./tabela-cores.component.scss']
})
export class TabelaCoresComponent {

  utility = Utility;

  totalItems: number = 0;
  items$: Observable<Cor[]>;
  refresh$ = new Subject();
  displayedColumns: string[] = ['nome', 'ativo', 'opcoes'];
  filtroCores: CoresFiltro;

  @ViewChild('paginator') paginator: MatPaginator;

  @Input('filtro') set setFiltro(filtros: CoresFiltro) {
    this.filtroCores = filtros;
    this.carregarGrid(filtros);
  }

  @Input('refreshGrid') set setRefreshGrid(value) {
    this.refresh$.next(undefined);
  }

  @Output() atualizarCorGrid = new EventEmitter();

  constructor(private veiculoService: VeiculoService, private store: Store<{ infoLoading: IInfoLoadingState }>, private notifierService: NotifierService,
    private dialog: MatDialog) {}

  ngAfterViewInit() {
    setTimeout(() => {this.carregarGrid()}, 100);
  }

  carregarGrid(filtros: CoresFiltro = null) {
    this.items$ = merge(this.refresh$, this.paginator?.page).pipe(
      startWith({}),
      switchMap(() => {
        return this.listarCores(this.paginator?.pageIndex, this.paginator?.pageSize, filtros);
      }),
      map((result: { totalItems: number; cores: Cor[] }) => {
        this.store.dispatch(closePreloader());
        this.totalItems = result.totalItems || 0;
        return result.cores;
      }),
      catchError((err) => {
        console.info(err);
        this.store.dispatch(closePreloader());
        return of([]);
      })
    );
  }

  listarCores(pageIndex: number, pageSize: number, filtros: CoresFiltro = null): Observable<ObterCoresResponse> {
    this.store.dispatch(showPreloader({ payload: '' }));
    const filtro = this.obterParametros(pageIndex, pageSize, filtros);
    return this.veiculoService.obterCoresVeiculos(filtro);
  }

  obterParametros(pageIndex: number = 0, pageSize: number = 25, filtros: CoresFiltro = null) {
    let filtro = <CoresFiltro>{
      Nome: filtros?.Nome || null,
      Status: filtros ? filtros.Status : null,
      PageIndex: pageIndex,
      PageSize: pageSize,
    };
    return filtro;
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }

  alterarStatus(cor: Cor) {
    this.veiculoService.alterarStatusCor(cor).subscribe((response) => {
      if (response.isSuccessful) {
        let fraseSucesso: string = 'Cor ' +  (response.ativado ? 'ativada' : 'desativada') + ' com sucesso!';
        this.notifierService.showNotification(fraseSucesso, 'Sucesso', 'success');
        this.atualizarCorGrid.emit();
        return;
      }
      this.notifierService.showNotification(response.errors[0].message, null, 'error');
    })
  }

  openDialogEditarCor(cor: Cor) {
    const dialogRef = this.dialog.open(DialogAdicionarCorComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'editar-cor'),
      width: '500px',
      data: cor
    });

    dialogRef.afterClosed().subscribe((response) => {
      response && this.alterarCor(response);
    });
  }

  alterarCor(cor: Cor) {
    this.veiculoService.alterarCor(cor).subscribe((response) => {
      if (response.isSuccessful) {
        this.notifierService.showNotification('Cor alterada com sucesso!', 'Sucesso', 'success');
        this.atualizarCorGrid.emit();
        return;
      }
      this.notifierService.showNotification(response.errors[0].message, null, 'error');
    })
  }

}
