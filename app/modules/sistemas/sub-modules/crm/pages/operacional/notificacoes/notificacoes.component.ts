import { Component, OnInit, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { BehaviorSubject, Observable, Subject, of, merge } from 'rxjs';
import { DatePipe } from '@angular/common';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { ObterNotificacoesPaginationResponse } from '../../../core/responses/notificacao/obter-notificacoes-paginado.response';
import { NotificacoesService } from '../../../services/notificacoes.service';
import { NotificacaoPaginado } from '../../../core/models/notificacao/notificacao-paginado';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { NotificacaoFiltro } from '../../../core/models/notificacao/notificacaoFiltro.models';
import { AbstractControl, FormControl } from '@angular/forms';
import { UsuariosService } from '../../../../admin/services/usuarios.service';
import { UsuariosFiltro } from '../../../../admin/core/models/usuarios/usuarios-filtro.model';
import { DominioService } from '../../../services/dominio.service';
import { FilterFieldReturn } from 'src/app/shared/core/models/grid-filter/filter-field-return.model';

@Component({
  selector: 'app-notificacoes',
  templateUrl: './notificacoes.component.html',
  styleUrls: ['./notificacoes.component.scss']
})
export class NotificacoesComponent implements OnInit {
  showRedefinirBtn: boolean = false;
  utility = Utility;
  Permissoes = Permissoes;

  constructor(
    private store: Store<{ preloader: IPreloaderState }>,
    private notificacoesService: NotificacoesService, // CRM NotificacoesService
    private router: Router,
    private notifierService: NotifierService,
    private usuariosService: UsuariosService,
    private dominioService: DominioService) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) this.childstate = val['url']?.includes('incluir') || val['url']?.includes('editar');
      if (this.init && !this.childstate) {
        this.refresh$.next(undefined);
      }
    })
  }

  displayedColumnsNotificacoes: string[] = [
    'titulo',
    'criadoPor',
    'canal',
    'categoria',
    'dataInicio',
    'dataEnvio',
    'status',
    'acoes',
  ];

  @ViewChild('paginator') paginator: MatPaginator;

  items$: Observable<NotificacaoPaginado[]>;
  notificacoes: NotificacaoPaginado[] = [];
  refresh$ = new Subject();
  pipe = new DatePipe('en-US');
  readonly isLoadingResults$ = new BehaviorSubject(true);

  dataSource = new MatTableDataSource(this.notificacoes);
  totalItems = 0;
  filtroNotificacao: NotificacaoFiltro = null;
  childstate: boolean = false;
  init: boolean = false;

  sortListaNotificacoes: string = '';
  filterListaNotificacoes: FieldOption[] = [];

  usuarioField =
    <FilterField>{
      id: 'usuarioGuid',
      titulo: 'Por usuário',
      tipo: TipoFilterField.Checkbox,
      options: this.filterListaNotificacoes,
      searchInput: true,
      showTooltip: true
    };

  tituloField =
    <FilterField>{
      id: 'tituloId',
      titulo: 'Por título',
      tipo: TipoFilterField.Checkbox,
      options: [],
      searchInput: true,
      showTooltip: true
    };

  tipoNotificacaoField =
    <FilterField>{
      id: 'tipoNotificacao',
      titulo: 'Por canal',
      tipo: TipoFilterField.Checkbox,
      selectAllOptions: 'Todos',
      options: [
        <FieldOption>{ value: 1, label: 'Portal eContrato' },
        <FieldOption>{ value: 2, label: 'E-mail' },
      ],
    };

  categoriaField =
    <FilterField>{
      id: 'categoriaId',
      titulo: 'Por categoria',
      tipo: TipoFilterField.Checkbox,
      selectAllOptions: 'Todos',
      options: []
    };

  statusField =
    <FilterField>{
      id: 'statusNotificacaoId',
      titulo: 'Por status',
      tipo: TipoFilterField.Checkbox,
      selectAllOptions: 'Todos',
      options: [
        <FieldOption>{ value: 1, label: 'Ativo' },
        <FieldOption>{ value: 2, label: 'Inativo' },
        <FieldOption>{ value: 3, label: 'Enviado' },
        <FieldOption>{ value: 4, label: 'Agendado' }
      ],
    };

  usuariosControl: FormControl;
  usuariosSearchControl: FormControl;
  tipoNotificacaoControl: FormControl;
  categoriaControl: FormControl;
  statusControl: FormControl;

  filter: GridFilter = <GridFilter>{
    id: 'notificacoes',
    customFields: false,
    fields: [
      this.usuarioField,
      this.tipoNotificacaoField,
      this.categoriaField,
      this.statusField,
      this.tituloField
    ]
  };

  ngOnInit(): void {
    this.carregarCategorias();
  }

  ngAfterViewInit(): void {
    if (!this.childstate) {
      this.carregaGridNotificacoes();
    }
    this.init = true;
  }

  search(event) {
    this.filtroNotificacao = <NotificacaoFiltro>{
      usuarioGuid: event.get('usuarioGuid'),
      tituloId: event.get('tituloId'),
      tipoNotificacao: event.get('tipoNotificacao'),
      categoriaId: event.get('categoriaId'),
      statusNotificacaoId: event.get('statusNotificacaoId'),
    }

    if (this.filtroNotificacao.tipoNotificacao && this.filtroNotificacao.tipoNotificacao.length >= 2) {
      this.filtroNotificacao.tipoNotificacao = null;
    }
    this.showRedefinirBtn = true;
    this.carregaGridNotificacoes();
  }

  redefinir() {
    this.filtroNotificacao = null;
    this.paginator.pageIndex = 0;
    this.showRedefinirBtn = false;
    this.carregaGridNotificacoes();
  }

  carregaGridNotificacoes() {
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }

    this.items$ = merge(this.refresh$, this.paginator.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarNotificacoes(
          this.filtroNotificacao,
          this.paginator.pageIndex,
          this.paginator.pageSize
        );
      }),
      map((result: { totalItems: number; notificacoes: NotificacaoPaginado[] }) => {
        this.totalItems = result.totalItems;
        this.dataSource = new MatTableDataSource<NotificacaoPaginado>(result.notificacoes);
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader());

        return result.notificacoes;
      }),
      catchError((err) => {
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader());
        return of([]);
      })
    );
  }

  listarNotificacoes(
    filtros: any,
    pageIndex: number = 0,
    pageSize: number = 25
  ): Observable<ObterNotificacoesPaginationResponse> {
    this.store.dispatch(showPreloader({ payload: '' }));

    const filtro = this.getParams(pageIndex, pageSize, filtros);
    return this.notificacoesService.obterNotificacoesPaginado(
      pageIndex, pageSize, filtro
    );
  }

  getParams(pageIndex: number = 0, pageSize: number = 5, filtros: NotificacaoFiltro = null) {
    let filtro = <NotificacaoFiltro>{
      usuarioGuid: filtros != null ? (filtros.usuarioGuid != null ? filtros.usuarioGuid : '') : '',
      tituloId: filtros != null ? (filtros.tituloId != null ? filtros.tituloId : '') : '',
      tipoNotificacao: filtros != null ? (filtros.tipoNotificacao != null ? filtros.tipoNotificacao : '') : '',
      categoriaId: filtros != null ? (filtros.categoriaId != null ? filtros.categoriaId : '') : '',
      statusNotificacaoId: filtros != null ? (filtros.statusNotificacaoId != null ? filtros.statusNotificacaoId : '') : '',
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

  incluirNotificacao() {
    this.childstate = true;
    this.router.navigate([`/notificacoes/incluir-notificacao`]);
  }

  editarNotificacao(notificacaoId: number) {
    this.childstate = true;
    this.router.navigate([`/notificacoes/editar-notificacao/${notificacaoId}`]);
  }

  formatDate(date: string) {
    return Utility.formatGridDate(date);
  }

  inativarOuAtivarNotificacao(notificacaoId: number, ativo: boolean) {
    if (ativo) {
      this.notificacoesService.inativarNotificacao(notificacaoId).subscribe((result) => {
        if (result.errors) {
          this.notifierService.showNotification(result.errors[0].message, null, 'error');
          return;
        }

        this.notifierService.showNotification(
          'Comunicado inativado com sucesso.',
          'Sucesso',
          'success'
        );
        this.carregaGridNotificacoes();
      });
      return;
    }

    this.notificacoesService.ativarNotificacao(notificacaoId).subscribe((result) => {
      if (result.errors) {
        this.notifierService.showNotification(result.errors[0].message, null, 'error');
        return;
      }

      this.notifierService.showNotification(
        'Comunicado ativado com sucesso.',
        'Sucesso',
        'success'
      );
      this.carregaGridNotificacoes();
    });
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  searchField(event) {
    let filtroUsuario = new UsuariosFiltro();
    let valor = Utility.checkNumbersOnly(event.value);

    switch (event.label) {
      case this.usuarioField.id:
        if (valor) filtroUsuario.nome = valor;
        this.carregarUsuariosFiltro(this.usuarioField, filtroUsuario);
        return;

      case this.tituloField.id:
        let filtro = new NotificacaoFiltro();
        if (valor) filtro.titulo = valor;
        this.carregarTitulosFiltro(filtro);
        return;
    }
  }

  private carregarCategorias() {
    this.dominioService.obterPorTipo('CATEGORIA_NOTIFICACAO').subscribe(response => {
      let options = [];
      if (response.isSuccessful) {
        response.valorDominio.forEach(valor => {
          options.push(<FieldOption>{ label: valor.valor, value: valor.id });
        })
      }

      this.categoriaField.options = options;
    })
  }

  private carregarUsuariosFiltro(field: FilterField, filtro: UsuariosFiltro = null) {
    let sort = 'primeiroNome.asc';

    filtro.pageIndex = 0;
    filtro.pageSize = 10;

    this.usuariosService.obterUsuarios(filtro, sort).subscribe(response => {
      let options = [];

      response.usuarios.forEach(usuario => {
        let label = `${usuario.primeiroNome} ${usuario.sobrenome} - ${usuario.email}`;

        options.push(<FieldOption>{
          label: label,
          value: usuario.usuarioGuid
        });
      });

      field.options = options;
    })
  }

  private carregarTitulosFiltro(filtro: NotificacaoFiltro = null) {
    this.notificacoesService.obterNotificacoesPaginado(0, 10, filtro).subscribe(response => {
      let options = [];

      if (response.notificacoes) {
        response.notificacoes.forEach(notificacao => {
          options.push(<FieldOption>{
            label: `${notificacao.titulo} (Canal: ${notificacao.canal})`,
            value: notificacao.id
          });
        });
      }

      this.tituloField.options = options;
    })
  }
}
