import { Component, OnInit, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { BehaviorSubject, Observable, Subject, of, merge } from 'rxjs';
import { DatePipe } from '@angular/common';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { AbstractControl, FormControl } from '@angular/forms';
import { FilterFieldReturn } from 'src/app/shared/core/models/grid-filter/filter-field-return.model';

import { AplicacoesService } from '../../../services/aplicacoes.service';
import { ObterAplicacoesPaginationResponse } from '../../../core/responses/aplicacoes/obter-aplicacao-paginado.response';

import { DialogSimpleService } from 'src/app/shared/components/dialog-simple/dialog-simple.service';
import { AplicacaoFiltro, AplicacaoPaginado } from '../../../core/models/aplicacoes/aplicacoes-paginado';

@Component({
  selector: 'app-aplicacoes-list',
  templateUrl: './aplicacoes-list.component.html',
  styleUrls: ['./aplicacoes-list.component.scss']
})
export class AplicacoesComponent {
  showRedefinirBtn: boolean = false;
  utility = Utility;
  Permissoes = Permissoes;

  constructor(
    private store: Store<{ preloader: IPreloaderState }>,
    private produtoAplicacoesService: AplicacoesService,
    private router: Router,
    private notifierService: NotifierService,
    private activatedRoute: ActivatedRoute,
    public dialog: DialogSimpleService) {

  }

  displayedColumnsAplicacoes: string[] = [
    'nome',
    'atualizadoEm',
    'ativo',
    'acoes',
  ];

  @ViewChild('paginator') paginator: MatPaginator;

  items$: Observable<AplicacaoPaginado[]>;
  items: AplicacaoPaginado[] = [];
  refresh$ = new Subject();
  pipe = new DatePipe('en-US');
  readonly isLoadingResults$ = new BehaviorSubject(true);

  dataSource = new MatTableDataSource(this.items);
  totalItems = 0;
  filtroNome: AplicacaoFiltro = null;
  childstate: boolean = false;
  init: boolean = false;

  sortListaAplicacoes: string = '';
  filterListaAplicacoes: FieldOption[] = [];




  statusField =
    <FilterField>{
      id: 'status',
      titulo: 'Por status',
      tipo: TipoFilterField.Checkbox,
      selectAllOptions: 'Todos',
      options: [
        <FieldOption>{ value: 1, label: 'Ativo' },
        <FieldOption>{ value: 2, label: 'Inativo' }
      ],
    };


  statusControl: FormControl;

  filter: GridFilter = <GridFilter>{
    id: 'aplicacoes',
    customFields: false,
    fields: [
      this.statusField,

    ]
  };

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (!this.childstate) {
      this.carregaGridAplicacoes();
    }
    this.init = true;
  }

  search(event) {
    this.filtroNome = <AplicacaoFiltro>{
      sigla: event.get('sigla'),
      status: event.get('status')
    }


    this.showRedefinirBtn = true;
    this.carregaGridAplicacoes();
  }

  redefinir() {
    this.filtroNome = null;
    this.paginator.pageIndex = 0;
    this.showRedefinirBtn = false;
    this.carregaGridAplicacoes();
  }

  carregaGridAplicacoes() {
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }

    this.items$ = merge(this.refresh$, this.paginator.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarAplicacoes(
          this.filtroNome,
          this.paginator.pageIndex,
          this.paginator.pageSize
        );
      }),
      map((result: { totalItems: number; items: AplicacaoPaginado[] }) => {
        this.totalItems = result.totalItems;

        this.dataSource = new MatTableDataSource<AplicacaoPaginado>(result.items);
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader());


        return result.items;
      }),
      catchError((err) => {
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader());
        return of([]);
      })
    );
  }

  listarAplicacoes(
    filtros: any,
    pageIndex: number = 0,
    pageSize: number = 25
  ): Observable<ObterAplicacoesPaginationResponse> {
    this.store.dispatch(showPreloader({ payload: '' }));

    const filtro = this.getParams(pageIndex, pageSize, filtros);

    return this.produtoAplicacoesService.obterAplicacaoPaginado(
      pageIndex, pageSize, filtro
    );
  }

  getParams(pageIndex: number = 0, pageSize: number = 5, filtros: AplicacaoFiltro = null) {
    let filtro = <AplicacaoFiltro>{
      status: filtros != null ? (filtros.status != null ? filtros.status : '') : '',
      sigla: filtros != null ? (filtros.sigla != null ? filtros.sigla : '') : '',
      PageIndex: pageIndex,
      PageSize: pageSize
    }

    return filtro;
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }


  formatDate(date: string) {
    return Utility.formatGridDate(date);
  }



  stopPropagation(event) {
    event.stopPropagation();
  }


  criarAplicacao() {
    this.childstate = true;
    this.router.navigate(['/egarantia-aplicacoes/incluir-aplicacao'], {
      relativeTo: this.activatedRoute,
    });
  }


  editarAplicacao(id: string) {
    this.router.navigate(['/egarantia-aplicacoes/incluir-aplicacao', id]);
  }

  excluirAplicacao(id: string) {
    const dialogRef = this.dialog.showDialog(
      'Tem certeza de que deseja excluir este Aplicacao? Esta ação não pode ser desfeita.',
      'Excluir',
      'Confirmação'
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // O usuário confirmou, prosseguir com a exclusão
        this.produtoAplicacoesService.excluirAplicacao(id).subscribe(
          () => {
            this.refresh$.next(null);
            this.notifierService.showNotification('Aplicacao excluído com sucesso.', 'Sucesso', 'success');
          },
          (error) => {
            // Trate o erro aqui
            this.notifierService.showNotification(`Erro ${error.status}: Ocorreu um problema ao excluir o Aplicacao.`, 'Erro', 'error');
          }
        );
      } else {
        // O usuário cancelou, não faz nada
        this.notifierService.showNotification('A exclusão foi cancelada.', 'Informação', 'info');
      }
    });
  }


}
