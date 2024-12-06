import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, catchError, map, merge, of, startWith, switchMap } from 'rxjs';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { MarcasFiltro } from 'src/app/modules/sistemas/sub-modules/crm/core/models/veiculos/marcas-filtro.model';
import { Marcas } from 'src/app/modules/sistemas/sub-modules/crm/core/models/veiculos/marcas.model';
import { ObterMarcasResponse } from 'src/app/modules/sistemas/sub-modules/crm/core/responses/veiculo/obter-marcas.response';
import { VeiculoService } from 'src/app/modules/sistemas/sub-modules/crm/services/veiculo.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { IInfoLoadingState } from 'src/app/shared/store/info-loading/info-loading.reducer';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { DialogAdicionarMarcaComponent } from '../dialog-adicionar-marca/dialog-adicionar-marca.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-tabela-marcas',
  templateUrl: './tabela-marcas.component.html',
  styleUrls: ['./tabela-marcas.component.scss']
})
export class TabelaMarcasComponent {

  utility = Utility;

  totalItems: number = 0;
  items$: Observable<Marcas[]>;
  refresh$ = new Subject();
  displayedColumns: string[] = ['nome', 'ativo', 'opcoes'];
  filtroMarcas: MarcasFiltro;

  @ViewChild('paginator') paginator: MatPaginator;

  @Input('filtro') set setFiltro(filtros: MarcasFiltro) {
    this.filtroMarcas = filtros;
    this.carregarGrid(filtros);
  }

  @Input('refreshGrid') set setRefreshGrid(value) {
    this.refresh$.next(undefined);
  }

  @Output() atualizarMarcaGrid = new EventEmitter();

  constructor(private veiculoService: VeiculoService, private store: Store<{ infoLoading: IInfoLoadingState }>, 
    private notifierService: NotifierService, private router: Router, private activatedRoute: ActivatedRoute, private dialog: MatDialog) {}

  ngAfterViewInit() {
    setTimeout(() => {this.carregarGrid()}, 100);
  }

  carregarGrid(filtros: MarcasFiltro = null) {
    this.items$ = merge(this.refresh$, this.paginator?.page).pipe(
      startWith({}),
      switchMap(() => {
        return this.listarMarcas(this.paginator?.pageIndex, this.paginator?.pageSize, filtros);
      }),
      map((result: { totalItems: number; marcas: Marcas[] }) => {
        this.store.dispatch(closePreloader())
        this.totalItems = result.totalItems || 0;
        return result.marcas;
      }),
      catchError((err) => {
        console.info(err);
        this.store.dispatch(closePreloader())
        return of([]);
      })
    );
  }

  listarMarcas(pageIndex: number, pageSize: number, filtros: MarcasFiltro = null): Observable<ObterMarcasResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))
    const filtro = this.obterParametros(pageIndex, pageSize, filtros);
    return this.veiculoService.obterMarcasVeiculos(filtro);
  }

  obterParametros(pageIndex: number = 0, pageSize: number = 25, filtros: MarcasFiltro = null) {
    let filtro = <MarcasFiltro>{
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

  alterarStatus(marca: Marcas) {
    this.veiculoService.alterarStatusMarca(marca).subscribe((response) => {
      if (response.isSuccessful) {
        let fraseSucesso: string = 'Marca ' +  (response.ativado ? 'ativada' : 'desativada') + ' com sucesso!';
        this.notifierService.showNotification(fraseSucesso, 'Sucesso', 'success');
        this.atualizarMarcaGrid.emit();
        return;
      }
      this.notifierService.showNotification(response.errors[0].message, null, 'error');
    })
  }

  editarModelo(marca: Marcas) {
    const { id } = marca;
    this.router.navigate(['editar-modelos/', id], { relativeTo: this.activatedRoute });
  }

  openDialogEditarMarca(marca: Marcas) {
    const dialogRef = this.dialog.open(DialogAdicionarMarcaComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'editar-modelo'),
      width: '500px',
      data: marca
    });

    dialogRef.afterClosed().subscribe((response) => {
      response && this.alterarMarca(response);
    });
  }

  alterarMarca(marca: Marcas) {
    this.veiculoService.alterarMarca(marca).subscribe((response) => {
      if (response.isSuccessful) {
        this.notifierService.showNotification('Marca alterada com sucesso!', 'Sucesso', 'success');
        this.atualizarMarcaGrid.emit();
        return;
      }
      this.notifierService.showNotification(response.errors[0].message, null, 'error');
    })
  }

}
