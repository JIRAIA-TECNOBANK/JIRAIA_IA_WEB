import { DatePipe } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Store } from '@ngrx/store';
import { BehaviorSubject, catchError, map, merge, Observable, of, startWith, Subject, switchMap } from 'rxjs';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { UsuarioServicoGrid } from '../../../../core/models/usuario-servico/usuario-servico-grid.model';
import { UsuarioApiRequest } from '../../../../core/requests/usuario-api/usuario-api.request';
import { AtivarInativarUsuarioApiResponse } from '../../../../core/responses/usuario-api/ativar-inativar-usuario-api.response';
import { ObterUsuariosSrdResponse } from '../../../../core/responses/usuario-servico/obter-usuarios-srd.response';
import { EmpresasService } from '../../../../services/empresas.service';
import { UsuarioServicoService } from '../../../../services/usuario-servico.service';
import { DialogEnviarCredenciaisComponent } from '../dialog-enviar-credenciais/dialog-enviar-credenciais.component';

@Component({
  selector: 'app-table-usuarios-srd',
  templateUrl: './table-usuarios-srd.component.html',
  styleUrls: ['./table-usuarios-srd.component.scss']
})
export class TableUsuariosSrdComponent {

  constructor(private notifierService: NotifierService,
    private dialog: MatDialog,
    private store: Store<{ preloader: IPreloaderState }>,
    private empresasService: EmpresasService,
    private usuariosServicoService: UsuarioServicoService,
    private dialogService: DialogCustomService) { }

  utility = Utility;
  Permissoes = Permissoes;

  @Input() empresaId: number;

  displayedColumns: string[] = [
    'usuario',
    'senha',
    'ultimaTransacao',
    'emails',
    'ativo',
    'acoes'
  ];

  items$: Observable<UsuarioServicoGrid[]>;
  refresh$ = new Subject();
  usuariosSrd: UsuarioServicoGrid[] = [];
  dataSource = new MatTableDataSource(this.usuariosSrd);
  pipe = new DatePipe('en-US');
  readonly isLoadingResultsUsuarios$ = new BehaviorSubject(true);

  envioEmails: string[] = [];
  totalItemsUsuarios = 0;
  init: boolean = false;

  @ViewChild('paginatorUsuariosSrd') paginatorUsuariosSrd: MatPaginator;
  @Input('refreshGrid') set setRefreshGrid(value) { if (this.init) { this.carregaGridUsuariosApi(); } }

  ngAfterViewInit() {
    this.init = true;
    this.carregaGridUsuariosApi();
  }

  carregaGridUsuariosApi() {
    if (this.paginatorUsuariosSrd) { this.paginatorUsuariosSrd.pageIndex = 0; }

    this.items$ = merge(this.refresh$, this.paginatorUsuariosSrd.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResultsUsuarios$.next(true);
        return this.listarUsuarios(this.empresaId, this.paginatorUsuariosSrd.pageIndex, this.paginatorUsuariosSrd.pageSize);
      }),
      map((result: { totalItems: number; usuariosServico: UsuarioServicoGrid[] }) => {
        this.totalItemsUsuarios = result.totalItems;
        this.dataSource = new MatTableDataSource<UsuarioServicoGrid>(result.usuariosServico);
        this.isLoadingResultsUsuarios$.next(false);
        this.store.dispatch(closePreloader())

        return result.usuariosServico;
      }),
      catchError((err) => {
        this.isLoadingResultsUsuarios$.next(false);
        this.dataSource = new MatTableDataSource<UsuarioServicoGrid>([]);
        this.totalItemsUsuarios = 0;
        this.store.dispatch(closePreloader())
        return of([]);
      })
    );
  }

  private listarUsuarios(empresaId: number, pageIndex: number, pageSize: number): Observable<ObterUsuariosSrdResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))
    return this.usuariosServicoService.obterUsuariosServicoSrdPaginado(empresaId, pageIndex, pageSize);
  }

  inativarOuAtivarUsuarioApi(usuarioId: number, ativo: boolean) {
    this.store.dispatch(showPreloader({ payload: '' }));

    this.usuariosServicoService.ativarInativarUsuarioServico(usuarioId).subscribe({
      next: (response) => {
        if (response.id) {
          this.sucessoAtivacaoInativacao(ativo);
          return;
        }

        this.erroAtivacaoInativacao(response);
      },
      error: (error) => {
        this.erroAtivacaoInativacao(error);
      }
    })

  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginatorUsuariosSrd.pageIndex = event.pageIndex;
    this.paginatorUsuariosSrd.pageSize = event.pageSize;
    this.paginatorUsuariosSrd.page.emit(event);
  }

  private sucessoAtivacaoInativacao(ativo: boolean) {
    this.store.dispatch(closePreloader());
    this.notifierService.showNotification(ativo ? 'Usuário inativado!' : 'Usuário ativado!', 'Sucesso', 'success');
    this.refresh$.next(undefined);
  }

  private erroAtivacaoInativacao(response: AtivarInativarUsuarioApiResponse) {
    this.store.dispatch(closePreloader());
    this.notifierService.showNotification(response.errors[0].message, 'Erro', 'error');
  }

  enviarCredenciais(usuarioId: number) {
    this.empresasService.setEmpresaId(this.empresaId);

    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: DialogEnviarCredenciaisComponent,
        title: '',
        buttonCancel: {
          value: false,
          text: 'Cancelar',
        },
        buttonConfirm: {
          value: true,
          text: 'Enviar'
        },
        disableSaveWithoutData: true
      },
    });

    dialogRef.beforeClosed().subscribe(confirmacao => {
      if (confirmacao) {
        this.store.dispatch(showPreloader({ payload: '' }));
        this.getEmails();
        this.enviaEmail(usuarioId, this.envioEmails);
      }
    });
  }

  getEmails() {
    this.dialogService.dialogData$.subscribe(response => {
      if (response.dataType == 'envioEmail') {
        this.envioEmails = response.data.emails;
      }
    });
  }

  enviaEmail(usuarioId: number, emails: string[]) {
    var usuarioApiRequest: UsuarioApiRequest = <UsuarioApiRequest>{ emailsRecebemNotificacao: emails };

    // this.usuariosApiService.enviarCredenciais(usuarioId, usuarioApiRequest).subscribe(response => {
    //   if (response.id) {
    this.store.dispatch(closePreloader());
    this.notifierService.showNotification('Credenciais enviadas com sucesso!', '', 'success');
    this.refresh$.next(undefined);
    //     return;
    //   }

    //   this.store.dispatch(closePreloader());
    //   this.notifierService.showNotification(response.errors[0].message, '', 'error');
    // })
  }

  redefinirSenha(usuarioId: number) {
    this.store.dispatch(showPreloader({ payload: '' }));

    // this.usuariosApiService.redefinirCredenciais(usuarioId).subscribe(response => {
    //   if (response.id) {
    this.store.dispatch(closePreloader());
    this.notifierService.showNotification('E-mail de redefinição de senha enviado com sucesso.', '', 'success');
    //     return;
    //   }

    //   this.store.dispatch(closePreloader());
    //   this.notifierService.showNotification(response.errors[0].message, 'Erro', 'error');
    // })
  }

  formatData(criadoEm: string) {
    if (criadoEm == undefined) return '-';

    return this.pipe.transform(criadoEm, 'dd/MM/yyyy - HH:mm');
  }

  formatarEmails(emails: string[]) {
    var retorno = ' - ';

    if (emails) {
      emails.forEach(email => {
        if (retorno) { retorno += ', ' + email; }
        else { retorno = email; }
      });
    }

    return retorno;
  }
}
