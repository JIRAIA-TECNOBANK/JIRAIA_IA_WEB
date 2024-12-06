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

import { DialogSimpleService } from 'src/app/shared/components/dialog-simple/dialog-simple.service';

import { ProtocolosService } from '../../../services/protocolos.service';
import { ObterProtocolosPaginationResponse } from '../../../core/responses/protocolos/obter-protocolo-paginado.response';
import { ProtocoloFiltro, ProtocoloPaginado } from '../../../core/models/protocolos/protocolos-paginado';

@Component({
  selector: 'app-protocolos-list',
  templateUrl: './protocolos-list.component.html',
  styleUrls: ['./protocolos-list.component.scss']
})
export class ProtocolosComponent {
  showRedefinirBtn: boolean = false;
  utility = Utility;
  Permissoes = Permissoes;

  constructor(
    private store: Store<{ preloader: IPreloaderState }>,
    private produtoProtocolosService: ProtocolosService,
    private router: Router,
    private notifierService: NotifierService,
    private activatedRoute: ActivatedRoute,
    public dialog: DialogSimpleService) {

  }

  displayedColumnsProtocolos: string[] = [
    'nome',
    'atualizadoEm',
    'nsu',
    'aplicacaoNome',
    'ativo',
    'acoes',
  ];

  @ViewChild('paginator') paginator: MatPaginator;

  items$: Observable<ProtocoloPaginado[]>;
  items: ProtocoloPaginado[] = [];
  refresh$ = new Subject();
  pipe = new DatePipe('en-US');
  readonly isLoadingResults$ = new BehaviorSubject(true);

  dataSource = new MatTableDataSource(this.items);
  totalItems = 0;
  filtroNome: ProtocoloFiltro = null;
  childstate: boolean = false;
  init: boolean = false;

  sortListaProtocolos: string = '';
  filterListaProtocolos: FieldOption[] = [];


  // Define filter fields
  protocoloField = <FilterField>{
    id: 'eGarantiaNumeroProtocolo',
    titulo: 'por nº de protocolo',
    tipo: TipoFilterField.Text
  };

  nsuField = <FilterField>{
    id: 'nsu',
    titulo: 'NSU',
    tipo: TipoFilterField.Text
  };

  numeroContratoField = <FilterField>{
    id: 'numeroContrato',
    titulo: 'Número do contrato',
    tipo: TipoFilterField.Text
  };

  aplicacaoField = <FilterField>{
    id: 'aplicacaoNome',
    titulo: 'Aplicação',
    tipo: TipoFilterField.Text
  };

  statusField =
    <FilterField>{
      id: 'status',
      titulo: 'Status',
      tipo: TipoFilterField.Checkbox,
      selectAllOptions: 'Todos',
      options: [
        <FieldOption>{ value: 1, label: 'Registrado' },
        <FieldOption>{ value: 2, label: 'Em Processamento' },
        <FieldOption>{ value: 3, label: 'Recusado' },
        <FieldOption>{ value: 4, label: 'NSU Processado' },
        <FieldOption>{ value: 5, label: 'Cancelado' },
        <FieldOption>{ value: 6, label: 'Erro' },
        <FieldOption>{ value: 7, label: 'Realizado Baixa' },
        <FieldOption>{ value: 8, label: 'Emissão Certidão' },
        <FieldOption>{ value: 9, label: 'Auto Apreensão Efetuada' },
        <FieldOption>{ value: 10, label: 'Registro AR' }
      ],
    };

  statusControl: FormControl;

  filter: GridFilter = <GridFilter>{
    id: 'protocolos',
    customFields: false,
    fields: [
      this.protocoloField,
      this.nsuField,
      this.numeroContratoField,
      this.statusField,
      this.aplicacaoField,
    ]
  };

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    if (!this.childstate) {
      this.carregaGridProtocolos();
    }
    this.init = true;
  }

  search(event) {
    this.filtroNome = <ProtocoloFiltro>{
      eGarantiaNumeroProtocolo: event.get('eGarantiaNumeroProtocolo'),
      nsu: event.get('nsu'),
      numeroContrato: event.get('numeroContrato'),
      aplicacaoNome: event.get('aplicacaoNome'),
      status: event.get('status')
    }

    this.showRedefinirBtn = true;
    this.carregaGridProtocolos();
  }

  redefinir() {
    this.filtroNome = null;
    this.paginator.pageIndex = 0;
    this.showRedefinirBtn = false;
    this.carregaGridProtocolos();
  }

  carregaGridProtocolos() {
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }

    this.items$ = merge(this.refresh$, this.paginator.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarProtocolos(
          this.filtroNome,
          this.paginator.pageIndex,
          this.paginator.pageSize
        );
      }),
      map((result: { totalItems: number; items: ProtocoloPaginado[] }) => {
        this.totalItems = result.totalItems;

        this.dataSource = new MatTableDataSource<ProtocoloPaginado>(result.items);
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

  listarProtocolos(
    filtros: any,
    pageIndex: number = 0,
    pageSize: number = 25
  ): Observable<ObterProtocolosPaginationResponse> {
    this.store.dispatch(showPreloader({ payload: '' }));

    const filtro = this.getParams(pageIndex, pageSize, filtros);

    return this.produtoProtocolosService.obterProtocoloPaginado(
      pageIndex, pageSize, filtro
    );
  }

  getParams(pageIndex: number = 0, pageSize: number = 5, filtros: ProtocoloFiltro = null) {
    let filtro = <ProtocoloFiltro>{
      eGarantiaNumeroProtocolo: filtros != null ? (filtros.eGarantiaNumeroProtocolo != null ? filtros.eGarantiaNumeroProtocolo : '') : '',
      nsu: filtros != null ? (filtros.nsu != null ? filtros.nsu : '') : '',
      numeroContrato: filtros != null ? (filtros.numeroContrato != null ? filtros.numeroContrato : '') : '',
      aplicacaoNome: filtros != null ? (filtros.aplicacaoNome != null ? filtros.aplicacaoNome : '') : '',
      status: filtros != null ? (filtros.status != null ? filtros.status : '') : '',
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

  criarProtocolo() {
    this.childstate = true;
    this.router.navigate(['/egarantia-protocolos/incluir-protocolo'], {
      relativeTo: this.activatedRoute,
    });
  }

  editarProtocolo(id: string) {
    this.router.navigate(['/egarantia-protocolos/incluir-protocolo', id]);
  }

  excluirProtocolo(id: string) {
    const dialogRef = this.dialog.showDialog(
      'Tem certeza de que deseja excluir este Protocolo? Esta ação não pode ser desfeita.',
      'Excluir',
      'Confirmação'
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // O usuário confirmou, prosseguir com a exclusão
        this.produtoProtocolosService.excluirProtocolo(id).subscribe(
          () => {
            this.refresh$.next(null);
            this.notifierService.showNotification('Protocolo excluído com sucesso.', 'Sucesso', 'success');
          },
          (error) => {
            // Trate o erro aqui
            this.notifierService.showNotification(`Erro ${error.status}: Ocorreu um problema ao excluir o Protocolo.`, 'Erro', 'error');
          }
        );
      } else {
        // O usuário cancelou, não faz nada
        this.notifierService.showNotification('A exclusão foi cancelada.', 'Informação', 'info');
      }
    });
  }
}
