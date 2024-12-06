import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { Utility } from 'src/app/core/common/utility';
import { Documento } from 'src/app/modules/sistemas/core/models/documento.model';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { EmpresaFiltro } from '../../../../core/models/empresas/empresa-filtro.model';
import { Empresas } from '../../../../core/models/empresas/empresas.model';
import { ObterEmpresasPaginationResponse } from '../../../../core/responses/empresas/obter-empresas-pagination.response';
import { EmpresasService } from '../../../../services/empresas.service';

import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Sort } from '@angular/material/sort';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';
import { Permissoes } from '../../../../../../../../core/common/permissoes';
import { EnvioEmailRequest } from '../../../../core/requests/empresas/envio-email.request';
import { EnvioEmailPendenciaComponent } from '../envio-email-pendencia/envio-email-pendencia.component';

@Component({
  selector: 'app-table-empresas',
  templateUrl: './table-empresas.component.html',
  styleUrls: ['./table-empresas.component.scss']
})
export class TableEmpresasComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  @Input() ativo = '';

  @Input('filtro') set setFiltro(value) {
    if (this.init) this.carregaGridEmpresas(value)
  }

  init: boolean = false;
  displayedColumns: string[] = [
    'codigo',
    'nomeFantasia',
    'cnpj',
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
  envioEmail: EnvioEmailRequest = null;
  sortTable: string = null;
  readonly isLoadingResults$ = new BehaviorSubject(true);

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private empresasService: EmpresasService,
    private notifierService: NotifierService,
    private store: Store<{ preloader: IPreloaderState }>,
    public dialog: MatDialog,
    private dialogService: DialogCustomService
  ) {
    router.events.subscribe((val) => {
      let navEnd =
      val instanceof NavigationEnd &&
      val.urlAfterRedirects == '/organizacoes?tab=empresas';
      if (navEnd) {
        this.refresh$.next(undefined);
      }
    });
  }

  ngOnInit(): void {
    this.listarEmpresas();
  }

  ngAfterViewInit() {
    this.carregaGridEmpresas();
    this.init = true;
  }

  carregaGridEmpresas(filtros: EmpresaFiltro = null) {
    if (this.paginator) { this.paginator.pageIndex = 0; }

    this.items$ = merge(this.refresh$, this.paginator.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarEmpresas(
          this.paginator.pageIndex,
          this.paginator.pageSize,
          filtros
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

  listarEmpresas(pageIndex: number = 0, pageSize: number = 25, filtros: EmpresaFiltro = null): Observable<ObterEmpresasPaginationResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))
    return this.empresasService.consultaEmpresas(pageIndex, pageSize, filtros);
  }

  inativarEmpresa(empresaId: string, ativo: boolean) {
    if (!this.utility.getPermission([Permissoes.GESTAO_EMPRESA_CADASTRAR])) return;

    if (ativo) {
      this.empresasService.inativarEmpresa(empresaId).subscribe((result) => {
        if (result.empresaId) {
          this.notifierService.showNotification(
            'Empresa inativada.',
            'Sucesso',
            'success'
          );
          this.listarEmpresas();
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
        this.listarEmpresas();
        this.refresh$.next(undefined);
      }
    });
  }

  editarEmpresa(empresaId: number) {
    this.router.navigate(['../organizacoes/empresas/atualizar-empresa/', empresaId], {
      relativeTo: this.activatedRoute,
    });
  }

  acessarGestaoAcessos(empresaId: number) {
    this.router.navigate(['../organizacoes/empresas/gestao-acessos', empresaId], {
      relativeTo: this.activatedRoute,
    });
  }

  formatDocumento() {
    return Documento.mascaraCNPJ();
  }

  formatDate(date: string) {
    return Utility.formatGridDate(date);
  }

  enviarEmail(empresaId: number) {
    this.empresasService.setEmpresaId(empresaId);

    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: EnvioEmailPendenciaComponent,
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
        this.getEmails(empresaId);
        this.enviaEmail(this.envioEmail);
      }
    })
  }

  getEmails(empresaId: number) {
    this.dialogService.dialogData$.subscribe(response => {
      if (response.dataType == 'envioEmail') {
        this.envioEmail = <EnvioEmailRequest>{ empresaId: empresaId, emails: response.data.emails };
      }
    });
  }

  enviaEmail(envioEmail: EnvioEmailRequest) {
    this.empresasService.envioEmailImgPendentes(envioEmail).subscribe(result => {
      if (result.isSuccessful) {
        this.notifierService.showNotification('E-mail de <strong>operações com imagens pendentes</strong> enviado com sucesso!', '', 'success');
        return;
      }

      this.notifierService.showNotification(result.errors[0].message, '', 'error');
    });
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }

  sortData(sort: Sort) {
    this.sortTable = `${sort.active}.${sort.direction}`;
    this.carregaGridEmpresas();
  }

  getAllGestaoAcessosPermissions() {
    let retorno = [];

    Object.keys(Permissoes).forEach(permissao => {
      if (permissao.startsWith('GESTAO_EMPRESA_USUARIO')) retorno.push(permissao);
    })

    return retorno;
  }
}
