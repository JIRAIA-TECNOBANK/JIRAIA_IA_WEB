import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { Sort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, BehaviorSubject, merge, of } from 'rxjs';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { Documento } from 'src/app/modules/sistemas/core/models/documento.model';
import { Usuario } from 'src/app/modules/sistemas/sub-modules/admin/core/models/usuarios/usuarios.model';
import { ObterUsuariosPaginationResponse } from 'src/app/modules/sistemas/sub-modules/admin/core/responses/usuarios/obter-usuarios-pagination.response';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { UsuariosFiltro } from '../../../../../core/models/usuarios/usuarios-filtro.model';
import { UsuariosService } from '../../../../../services/usuarios.service';

@Component({
  selector: 'app-table-usuarios',
  templateUrl: './table-usuarios.component.html',
  styleUrls: ['./table-usuarios.component.scss']
})
export class TableUsuariosComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  @Input('refreshGrid') set setRefreshGrid(value) {
    if (this.init) {
      if (this.refresh$.observers.length == 0) this.carregaGridUsuarios(value);
      else this.refresh$.next(undefined);
    }
  }

  @Output('atualizarGrids') atualizarGrids: EventEmitter<boolean> = new EventEmitter<boolean>();

  pesquisa: UsuariosFiltro = null;

  displayedColumns: string[] = [
    'nomeCompleto',
    'cpf',
    'email',
    'criadoEm',
    'modificadoEm',
    'status',
    'opcoes',
  ];

  usuarios: Usuario[] = [];
  dataSource = new MatTableDataSource(this.usuarios);
  totalRegistros: number = 0;
  usuario: Usuario;
  items$: Observable<Usuario[]>;
  totalItems = 0;
  refresh$ = new Subject();
  pipe = new DatePipe('en-US');
  sortListaUsuarios: string = '';
  readonly isLoadingResults$ = new BehaviorSubject(true);

  init: boolean = false;

  @ViewChild('paginator') paginator: MatPaginator;
  @Input('filtro') set setFiltro(value) {
    if (this.init) { this.carregaGridUsuarios(value) }
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private usuariosService: UsuariosService,
    private notifierService: NotifierService,
    private store: Store<{ preloader: IPreloaderState }>
  ) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd && val.urlAfterRedirects == '/usuarios';
      if (navEnd) { this.refresh$.next(undefined); }

    });
  }

  ngOnInit(): void {
    //    
  }

  ngAfterViewInit() {
    this.init = true;
    this.carregaGridUsuarios();
  }

  carregaGridUsuarios(filtros: UsuariosFiltro = null) {
    if (this.paginator) this.paginator.pageIndex = 0;

    this.items$ = merge(this.refresh$, this.paginator.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarUsuarios(
          this.paginator.pageIndex,
          this.paginator.pageSize,
          filtros
        );
      }),
      map((result: { totalItems: number; usuarios: Usuario[] }) => {
        this.totalItems = result.totalItems;
        this.dataSource = new MatTableDataSource<Usuario>(result.usuarios);
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader())

        return result.usuarios;
      }),
      catchError((err) => {
        this.isLoadingResults$.next(false);
        console.info(err);
        this.store.dispatch(closePreloader())
        return of([]);
      })
    );
  }

  listarUsuarios(pageIndex: number = 0, pageSize: number = 5, filtros: UsuariosFiltro = null): Observable<ObterUsuariosPaginationResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))
    const filtro = this.getParams(pageIndex, pageSize, filtros)
    return this.usuariosService.obterUsuarios(filtro, this.sortListaUsuarios);
  }

  getParams(pageIndex: number = 0, pageSize: number = 25, filtros: UsuariosFiltro = null) {
    let filtro = <UsuariosFiltro>{
      pageIndex: pageIndex,
      pageSize: pageSize
    };

    if (filtros) {
      if (filtros.ativo != null) { filtro.ativo = filtros.ativo; }
      if (filtros.usuarioId?.length > 0) filtro.usuarioId = filtros.usuarioId;
    }

    return filtro;
  }

  removeSpecialChar(documento: string): string {
    return documento.replace('.', '').replace('.', '').replace('-', '');
  }

  inativarUsuario(usuarioId: string, ativo: boolean) {
    if (ativo) {
      this.usuariosService.inativarUsuario(usuarioId).subscribe((result) => {
        if (result.usuarioGuid) {
          this.notifierService.showNotification(
            'Usuário inativado.',
            'Sucesso',
            'success'
          );
          this.listarUsuarios(0, 5, this.pesquisa);
          this.refresh$.next(undefined);
          this.atualizarGrids.emit(true);
        }
      });
      return;
    }

    this.usuariosService.ativarUsuario(usuarioId).subscribe((result) => {
      if (result.usuarioGuid) {
        this.notifierService.showNotification(
          'Usuário ativado.',
          'Sucesso',
          'success'
        );
        this.listarUsuarios(0, 5, this.pesquisa);
        this.refresh$.next(undefined);
        this.atualizarGrids.emit(true);
      }
    });
  }

  editarUsuario(usuarioId: number) {
    this.router.navigate(['../usuarios/editar-usuario/', usuarioId], {
      relativeTo: this.activatedRoute,
    });
  }

  formatDocumento() {
    return Documento.mascaraCPF();
  }

  formatDate(date: string) {
    return Utility.formatGridDate(date);
  }

  sortData(sort: Sort) {
    switch (sort.active) {
      case "nomeCompleto":
        this.sortListaUsuarios = `primeiroNome.${sort.direction}`
        break;

      case "email":
        this.sortListaUsuarios = `email.${sort.direction}`
        break;

      case "cpf":
        this.sortListaUsuarios = `documento.${sort.direction}`
        break;

      case "status":
        this.sortListaUsuarios = `ativo.${sort.direction}`
        break;

      default:
        this.sortListaUsuarios = `${sort.active}.${sort.direction}`
        break;
    }

    this.listarUsuarios(0, 5, this.pesquisa);
    this.refresh$.next(undefined);
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(tipoElemento, nomeElemento, guidElemento);
  }
}
