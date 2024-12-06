import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';

import { Utility } from 'src/app/core/common/utility';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { UsuariosEmpresa } from '../../../../core/models/empresas/usuarios-empresa.model';
import { ObterUsuariosEmpresaPaginationResponse } from '../../../../core/responses/empresas/obter-usuarios-empresa-pagination.response';
import { UsuariosEmpresaService } from '../../../../services/usuarios-empresa.service';
import { DefinicaoSenhaComponent } from '../definicao-senha/definicao-senha.component';

import { Store } from '@ngrx/store';
import { BehaviorSubject, merge, Observable, of, Subject } from 'rxjs';
import { catchError, map, switchMap, startWith } from 'rxjs/operators';
import { Permissao } from 'src/app/modules/sistemas/sub-modules/admin/core/models/perfis/permissao.model';
import { Permissoes } from '../../../../../../../../core/common/permissoes';
import { UsuarioEmpresaFiltro } from '../../../../core/models/usuarios-empresa/usuario-empresa-filtro.model';
import { Documento } from 'src/app/modules/sistemas/core/models/documento.model';

@Component({
  selector: 'app-table-usuarios',
  templateUrl: './table-usuarios.component.html',
  styleUrls: ['./table-usuarios.component.scss']
})
export class TableUsuariosComponent implements OnInit {

  constructor(
    private usuarioEmpresaService: UsuariosEmpresaService,
    private store: Store<{ preloader: IPreloaderState }>,
    private notifierService: NotifierService,
    public dialog: MatDialog,
    private dialogService: DialogCustomService
  ) { }

  utility = Utility;
  Permissoes = Permissoes;

  displayedColumnsUsuarios: string[] = [
    'nomeCompleto',
    'email',
    'criadoEm',
    'modificadoEm',
    'perfil.nome',
    'ativo',
    'acoes',
  ];

  @Input() empresaId: number;
  @Input('refreshGrid') set setRefreshGrid(value) { if (this.init) { this.carregaGridUsuarios(); } }
  @Input('filtro') set setFiltro(value) {
    if (this.init) this.carregaGridUsuarios(value)
  }
  @Output('clickEditar') clickEditar: EventEmitter<number> = new EventEmitter<number>();
  @ViewChild('paginatorUsuarios') paginatorUsuarios: MatPaginator;
  @ViewChild('tableUsuarios') usuariosSort: MatSort;

  items$: Observable<UsuariosEmpresa[]>;
  totalItemsUsuarios = 0;
  refresh$ = new Subject();
  usuarios: UsuariosEmpresa[] = [];
  usuario: UsuariosEmpresa = undefined;
  dataSource = new MatTableDataSource(this.usuarios);
  sortListaUsuarios: string = '';
  init: boolean = false;
  permissoesGestaoAcessosUsuario: Permissao;
  readonly isLoadingResultsUsuarios$ = new BehaviorSubject(true);

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.init = true;
    this.carregaGridUsuarios(new UsuarioEmpresaFiltro());
  }

  carregaGridUsuarios(filtro: UsuarioEmpresaFiltro = null) {
    if (this.paginatorUsuarios) { this.paginatorUsuarios.pageIndex = 0; }

    this.items$ = merge(this.refresh$, this.paginatorUsuarios?.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResultsUsuarios$.next(true);
        return this.listarUsuarios(this.empresaId, this.paginatorUsuarios.pageIndex, this.paginatorUsuarios.pageSize, filtro);
      }),
      map((result: { totalItems: number; usuarios: UsuariosEmpresa[] }) => {
        this.totalItemsUsuarios = result.totalItems;
        this.dataSource = new MatTableDataSource<UsuariosEmpresa>(result.usuarios);
        this.isLoadingResultsUsuarios$.next(false);
        this.store.dispatch(closePreloader())
        this.dataSource.sort = this.usuariosSort;

        return result.usuarios;
      }),
      catchError((err) => {
        this.isLoadingResultsUsuarios$.next(false);
        console.info(err);
        this.store.dispatch(closePreloader())
        return of([]);
      })
    );
  }

  listarUsuarios(empresaId: number, pageIndex: number, pageSize: number, filtro: UsuarioEmpresaFiltro = null): Observable<ObterUsuariosEmpresaPaginationResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))
    return this.usuarioEmpresaService.obterUsuarios(empresaId, pageIndex, pageSize, this.sortListaUsuarios, filtro);
  }

  sortData(sort: Sort) {
    switch (sort.active) {
      case "nomeCompleto":
        this.sortListaUsuarios = `primeiroNome.${sort.direction}`
        break;

      default:
        this.sortListaUsuarios = `${sort.active}.${sort.direction}`
        break;
    }

    this.listarUsuarios(this.empresaId, 0, 25);
    this.refresh$.next(undefined);
  }

  formatDate(date: string) {
    return Utility.formatGridDate(date);
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginatorUsuarios.pageIndex = event.pageIndex;
    this.paginatorUsuarios.pageSize = event.pageSize;
    this.paginatorUsuarios.page.emit(event);
  }

  onClickEditar(id: number) {
    this.clickEditar.emit(id);
  }

  enviarEmail(email: string, userGuid: string) {
    this.usuarioEmpresaService.setEmail(email);

    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: DefinicaoSenhaComponent,
        buttonCancel: {
          value: false,
          text: 'Cancelar',
        },
        buttonConfirm: {
          value: true,
          text: 'Enviar',
        },
        disableSaveWithoutData: true
      },
    });

    dialogRef.afterClosed().subscribe(confirmacao => {
      if (confirmacao) {
        this.resetarSenha(email, userGuid)
      }
    })
  }

  resetarSenha(email: string, userGuid: string) {
    this.store.dispatch(showPreloader({ payload: '' }))
    this.usuarioEmpresaService.resetarSenha(userGuid).subscribe(result => {
      if (result.isSuccessful) {
        this.store.dispatch(closePreloader())
        this.notifierService.showNotification(`E-mail enviado para ${email}`, '', 'success');
        return
      }

      this.store.dispatch(closePreloader())
      this.notifierService.showNotification(result.errors[0].message, '', 'error');
    });
  }

  inativarOuAtivarUsuario(usuarioId: string, ativo: boolean) {
    if (ativo) {
      this.usuarioEmpresaService.inativarUsuario(usuarioId).subscribe((result) => {
        if (result.usuarioGuid) {
          this.notifierService.showNotification(
            'Usuário inativado.',
            'Sucesso',
            'success'
          );
          this.listarUsuarios(this.empresaId, 0, 25);
          this.refresh$.next(undefined);
        }
      });
      return;
    }

    this.usuarioEmpresaService.ativarUsuario(usuarioId).subscribe((result) => {
      if (result.usuarioGuid) {
        this.notifierService.showNotification(
          'Usuário ativado.',
          'Sucesso',
          'success'
        );
        this.listarUsuarios(this.empresaId, 0, 25);
        this.refresh$.next(undefined);
      }
    });
  }
}
