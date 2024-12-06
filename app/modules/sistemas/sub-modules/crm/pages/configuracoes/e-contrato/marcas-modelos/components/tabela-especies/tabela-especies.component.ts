import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Store } from '@ngrx/store';
import { Observable, Subject, catchError, map, merge, of, startWith, switchMap } from 'rxjs';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { Especie } from 'src/app/modules/sistemas/sub-modules/crm/core/models/veiculos/especie.model';
import { EspeciesFiltro } from 'src/app/modules/sistemas/sub-modules/crm/core/models/veiculos/especies-filtro.model';
import { ObterEspecieResponse } from 'src/app/modules/sistemas/sub-modules/crm/core/responses/veiculo/obter-especie.response';
import { VeiculoService } from 'src/app/modules/sistemas/sub-modules/crm/services/veiculo.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { IInfoLoadingState } from 'src/app/shared/store/info-loading/info-loading.reducer';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { DialogAdicionarEspecieComponent } from '../dialog-adicionar-especie/dialog-adicionar-especie.component';

@Component({
  selector: 'app-tabela-especies',
  templateUrl: './tabela-especies.component.html',
  styleUrls: ['./tabela-especies.component.scss']
})
export class TabelaEspeciesComponent {

  utility = Utility;

  totalItems: number = 0;
  items$: Observable<Especie[]>;
  refresh$ = new Subject();
  displayedColumns: string[] = ['nome', 'ativo', 'opcoes'];
  filtroEspecies: EspeciesFiltro;

  @ViewChild('paginator') paginator: MatPaginator;

  @Input('filtro') set setFiltro(filtros: EspeciesFiltro) {
    this.filtroEspecies = filtros;
    this.carregarGrid(filtros);
  }

  @Input('refreshGrid') set setRefreshGrid(value) {
    this.refresh$.next(undefined);
  }

  @Output() atualizarEspecieGrid = new EventEmitter();

  constructor(private veiculoService: VeiculoService, private store: Store<{ infoLoading: IInfoLoadingState }>, private notifierService: NotifierService,
    private dialog: MatDialog) {}

  ngAfterViewInit() {
    setTimeout(() => {this.carregarGrid()}, 100);
  }

  carregarGrid(filtros: EspeciesFiltro = null) {
    this.items$ = merge(this.refresh$, this.paginator?.page).pipe(
      startWith({}),
      switchMap(() => {
        return this.listarEspecie(this.paginator?.pageIndex, this.paginator?.pageSize, filtros);
      }),
      map((result: { totalItems: number; especies: Especie[] }) => {
        this.store.dispatch(closePreloader());
        this.totalItems = result.totalItems || 0;
        return result.especies;
      }),
      catchError((err) => {
        console.info(err);
        this.store.dispatch(closePreloader())
        return of([]);
      })
    );
  }

  listarEspecie(pageIndex: number, pageSize: number, filtros: EspeciesFiltro = null): Observable<ObterEspecieResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))
    const filtro = this.obterParametros(pageIndex, pageSize, filtros);
    return this.veiculoService.obterEspecieVeiculos(filtro);
  }

  obterParametros(pageIndex: number = 0, pageSize: number = 25, filtros: EspeciesFiltro = null) {
    let filtro = <EspeciesFiltro>{
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

  alterarStatus(especie: Especie) {
    this.veiculoService.alterarStatusEspecie(especie).subscribe((response) => {
      if (response.isSuccessful) {
        let fraseSucesso: string = 'Espécie ' +  (response.ativado ? 'ativada' : 'desativada') + ' com sucesso!';
        this.notifierService.showNotification(fraseSucesso, 'Sucesso', 'success');
        this.atualizarEspecieGrid.emit();
        return;
      }
      this.notifierService.showNotification(response.errors[0].message, null, 'error');
    })
  }

  openDialogEditarEspecie(especie: Especie) {
    const dialogRef = this.dialog.open(DialogAdicionarEspecieComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'editar-especie'),
      width: '500px',
      data: especie
    });

    dialogRef.afterClosed().subscribe((response) => {
      response && this.alterarEspecie(response);
    });
  }

  alterarEspecie(especie: Especie) {
    this.veiculoService.alterarEspecie(especie).subscribe((response) => {
      if (response.isSuccessful) {
        this.notifierService.showNotification('Espécie alterada com sucesso!', 'Sucesso', 'success');
        this.atualizarEspecieGrid.emit();
        return;
      }
      this.notifierService.showNotification(response.errors[0].message, null, 'error');
    })
  }

}
