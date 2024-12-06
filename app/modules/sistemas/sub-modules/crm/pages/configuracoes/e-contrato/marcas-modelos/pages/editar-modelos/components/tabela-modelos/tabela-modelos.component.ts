import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, catchError, map, merge, of, startWith, switchMap } from 'rxjs';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { Modelo } from 'src/app/modules/sistemas/sub-modules/crm/core/models/veiculos/modelo.model';
import { ModelosFiltro } from 'src/app/modules/sistemas/sub-modules/crm/core/models/veiculos/modelos-filtro.model';
import { ObterModelosResponse } from 'src/app/modules/sistemas/sub-modules/crm/core/responses/veiculo/obter-modelos.response';
import { VeiculoService } from 'src/app/modules/sistemas/sub-modules/crm/services/veiculo.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { IInfoLoadingState } from 'src/app/shared/store/info-loading/info-loading.reducer';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { DialogAdicionarModeloComponent } from '../dialog-adicionar-modelo/dialog-adicionar-modelo.component';

@Component({
  selector: 'app-tabela-modelos',
  templateUrl: './tabela-modelos.component.html',
  styleUrls: ['./tabela-modelos.component.scss']
})
export class TabelaModelosComponent {
  utility = Utility;

  totalItems: number = 0;
  items$: Observable<Modelo[]>;
  refresh$ = new Subject();
  displayedColumns: string[] = ['nome', 'ativo', 'opcoes'];
  filtroModelos: ModelosFiltro;

  marcaId: number;

  @ViewChild('paginator') paginator: MatPaginator;

  @Input('filtro') set setFiltro(filtros: ModelosFiltro) {
    this.filtroModelos = filtros;
    this.carregarGrid(filtros);
  }

  @Input('refreshGrid') set setRefreshGrid(value) {
    this.refresh$.next(undefined);
  }

  @Output() atualizarGrid = new EventEmitter();

  constructor(private veiculoService: VeiculoService, private store: Store<{ infoLoading: IInfoLoadingState }>, 
    private notifierService: NotifierService, private activeRoute: ActivatedRoute, private dialog: MatDialog) {}

  ngAfterViewInit() {
    this.activeRoute.paramMap.subscribe(params => {
      this.marcaId = +params.get('marcaId');
    });
    setTimeout(() => {this.carregarGrid()}, 100);
  }

  carregarGrid(filtros: ModelosFiltro = null) {
    this.items$ = merge(this.refresh$, this.paginator?.page).pipe(
      startWith({}),
      switchMap(() => {
        return this.listarModelos(this.paginator?.pageIndex, this.paginator?.pageSize, filtros);
      }),
      map((result: { totalItems: number; modelos: Modelo[] }) => {
        this.store.dispatch(closePreloader())
        this.totalItems = result.totalItems || 0;
        return result.modelos;
      }),
      catchError((err) => {
        this.store.dispatch(closePreloader())
        return of([]);
      })
    );
  }

  listarModelos(pageIndex: number, pageSize: number, filtros: ModelosFiltro = null): Observable<ObterModelosResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))
    const filtro = this.obterParametros(pageIndex, pageSize, filtros);
    return this.veiculoService.obterModelosVeiculos(filtro, this.marcaId);
  }

  obterParametros(pageIndex: number = 0, pageSize: number = 25, filtros: ModelosFiltro = null) {
    let filtro = <ModelosFiltro>{
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

  alterarStatus(modelo: Modelo) {
    this.veiculoService.alterarStatusModelo(modelo).subscribe((response) => {
      if (response.isSuccessful) {
        let fraseSucesso: string = 'Modelo ' +  (response.ativado ? 'ativado' : 'desativado') + ' com sucesso!';
        this.notifierService.showNotification(fraseSucesso, 'Sucesso', 'success');
        this.atualizarGrid.emit();
        return;
      }
      this.notifierService.showNotification(response.errors[0].message, null, 'error');
    })
  }

  openDialogEditarModelo(modelo: Modelo) {
    const dialogRef = this.dialog.open(DialogAdicionarModeloComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'editar-modelo'),
      width: '500px',
      data: modelo
    });

    dialogRef.afterClosed().subscribe((response) => {
      response && this.alterarModelo(response);
    });
  }

  alterarModelo(modelo: Modelo) {
    this.veiculoService.alterarModelo(modelo, this.marcaId).subscribe((response) => {
      if (response.isSuccessful) {
        this.notifierService.showNotification('Modelo alterado com sucesso!', 'Sucesso', 'success');
        this.atualizarGrid.emit();
        return;
      }
      this.notifierService.showNotification(response.errors[0].message, null, 'error');
    })
  }
}
