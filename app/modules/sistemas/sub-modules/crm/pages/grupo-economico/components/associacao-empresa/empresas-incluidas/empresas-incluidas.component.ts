import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, BehaviorSubject, merge, of } from 'rxjs';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';
import { Utility } from 'src/app/core/common/utility';
import { Documento } from 'src/app/modules/sistemas/core/models/documento.model';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { EmpresasFiltro } from '../../../../../core/models/empresas/empresas-filtro.model';
import { Empresas } from '../../../../../core/models/empresas/empresas.model';
import { ObterEmpresasPaginationResponse } from '../../../../../core/responses/empresas/obter-empresas-pagination.response';
import { EmpresasService } from '../../../../../services/empresas.service';
import { GruposEconomicosService } from '../../../../../services/grupos-economicos.service';
import { Permissoes } from 'src/app/core/common/permissoes';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { DialogAlertaExclusaoComponent } from '../dialog-alerta-exclusao/dialog-alerta-exclusao.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { EmpresaFaturamentoService } from 'src/app/modules/sistemas/sub-modules/faturamento/services/empresa.service';

@Component({
  selector: 'app-empresas-incluidas',
  templateUrl: './empresas-incluidas.component.html',
  styleUrls: ['./empresas-incluidas.component.scss']
})
export class EmpresasIncluidasComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  @Input('atualizar') set setAtualizar(value) {
    if (value) {
      this.listarEmpresas(this.grupoEconomicoId, 0, 5, this.filtro);
      this.refresh$.next(undefined);
    }
  }
  @Input() grupoEconomicoId = null;
  @Input('filtro') set setFiltroEmpresa(value) {
    this.filtro = value;
    if (this.init) { this.carregarGrid(); }
  }
  @Output() atualizarGrid = new EventEmitter<boolean>();

  filtro: EmpresasFiltro = null;
  init: boolean = false;

  displayedColumns: string[] = [
    'codigo',
    'nomeFantasia',
    'cnpj',
    'grupo',
    'criadoEm',
    'modificadoEm',
    'status',
    'opcoes',
  ];

  empresas: Empresas[] = [];
  dataSource = new MatTableDataSource(this.empresas);
  totalRegistros: number = 0;
  empresa: Empresas;
  items$: Observable<Empresas[]>;
  totalItems = 0;
  refresh$ = new Subject();
  pipe = new DatePipe('en-US');
  readonly isLoadingResults$ = new BehaviorSubject(true);

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private gruposEconomicosService: GruposEconomicosService,
    private empresasService: EmpresasService,
    private notifierService: NotifierService,
    private store: Store<{ preloader: IPreloaderState }>,
    public dialog: MatDialog,
    private empresaFaturamentoService: EmpresaFaturamentoService
  ) { }

  ngOnInit(): void {
    this.listarEmpresas(this.grupoEconomicoId, 0, 10, this.filtro);
  }

  ngAfterViewInit() {
    this.init = true;
    this.carregarGrid();
  }

  carregarGrid() {
    if (this.paginator) { this.paginator.pageIndex = 0; }

    this.items$ = merge(this.refresh$, this.paginator.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarEmpresas(
          this.grupoEconomicoId,
          this.paginator?.pageIndex,
          this.paginator?.pageSize,
          this.filtro
        );
      }),
      map((result: { totalItems: number; empresas: Empresas[] }) => {
        this.totalItems = result.totalItems;
        this.dataSource = new MatTableDataSource<Empresas>(result.empresas);
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader())

        return result.empresas;
      }),
      catchError((err) => {
        this.isLoadingResults$.next(false);
        console.info(err);
        this.store.dispatch(closePreloader())
        return of([]);
      })
    );
  }

  listarEmpresas(grupoEconomico: number = 2, pageIndex: number, pageSize: number, filtros: EmpresasFiltro = null): Observable<ObterEmpresasPaginationResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))
    const filtro = this.getParams(pageIndex, pageSize, filtros)
    return this.gruposEconomicosService.obterEmpresas(grupoEconomico, filtro);
  }

  getParams(pageIndex: number = 0, pageSize: number = 5, filtros: EmpresasFiltro = null) {
    let filtro = <EmpresasFiltro>{
      nome: filtros != null ? (filtros.nome != null ? filtros.nome : '') : '',
      disponiveis: false,
      pageIndex: pageIndex,
      pageSize: pageSize
    }

    return filtro;
  }

  inativarEmpresa(empresaId: string, ativo: boolean) {
    if (ativo) {
      this.empresasService.inativarEmpresa(empresaId).subscribe((result) => {
        if (result.empresaId) {
          this.notifierService.showNotification(
            'Empresa inativada.',
            'Sucesso',
            'success'
          );
          this.listarEmpresas(this.grupoEconomicoId, 0, 10, this.filtro);
          this.refresh$.next(undefined);
        }
      });
      return;
    }

    this.empresasService.ativarEmpresa(empresaId).subscribe((result) => {
      if (result.empresaId) {
        this.notifierService.showNotification(
          'Empresa ativada.',
          'Sucesso',
          'success'
        );
        this.listarEmpresas(this.grupoEconomicoId, 0, 10, this.filtro);
        this.refresh$.next(undefined);
      }
    });
  }

  editarEmpresa(empresaId: number) {
    this.router.navigate(['../empresas/atualizar-empresa/', empresaId], {
      relativeTo: this.activatedRoute,
    });
  }

  acessarGestaoAcessos(empresaId: number) {
    this.router.navigate(['gestao-acessos', empresaId], {
      relativeTo: this.activatedRoute,
    });
  }

  formatDocumento() {
    return Documento.mascaraCNPJ();
  }

  formatDate(date: string) {
    return Utility.formatGridDate(date);
  }

  excluir(cnpj: string, empresaId: number) {
    this.empresaFaturamentoService.existeDadosCobranca(cnpj, empresaId).subscribe((response) => {
      if (response.isSuccessful) {
        response.cobranca && this.abrirDialogAviso(empresaId);
        !response.cobranca && this.excluirEmpresa(empresaId);
        return;
      }
      this.notifierService.showNotification(response.errors[0].message, null, 'error')
    })
  }

  abrirDialogAviso(empresaId: number) {
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '650px',
      data: {
        component: DialogAlertaExclusaoComponent,
        titleClass: 'd-none',
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
        this.excluirEmpresa(empresaId);
      }
    })
  }

  excluirEmpresa(empresaId: number) {
    this.store.dispatch(showPreloader({ payload: '' }))
    this.atualizarGrid.emit(false);
    this.gruposEconomicosService.desvincularEmpresa(empresaId).subscribe(response => {
      if (response.errors) {
        this.notifierService.showNotification(response.errors[0].message, 'Erro', 'error');
        this.store.dispatch(closePreloader());
        return;
      }
      this.notifierService.showNotification('Empresa excluída do grupo econômico com sucesso.', 'Sucesso', 'success');
      this.listarEmpresas(this.grupoEconomicoId, 0, 10, this.filtro);
      this.refresh$.next(undefined);
      Utility.waitFor(() => { this.store.dispatch(closePreloader()); }, 3000)
      this.atualizarGrid.emit(true);
    })
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }
}
