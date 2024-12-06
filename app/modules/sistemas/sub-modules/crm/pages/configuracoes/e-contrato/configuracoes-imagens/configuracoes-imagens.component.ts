import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, of, Subject, merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { ConfigImagem } from '../../../../core/models/configuracoes/configImagem.model';
import { ObterConfigImagensResponse } from '../../../../core/responses/configuracoes/obter-imagens-config.response';
import { ConfiguracoesService } from '../../../../services/configuracoes.service';

@Component({
  selector: 'app-configuracoes-imagens',
  templateUrl: './configuracoes-imagens.component.html',
  styleUrls: ['./configuracoes-imagens.component.scss']
})
export class ConfiguracoesImagensComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  @ViewChild('paginator') paginator: MatPaginator;

  displayedColumns: string[] = [
    'detran',
    'tamanhoPorArquivoTBK',
    'tamanhoPorArquivoDetran',
    'extensaoTBK',
    'extensaoDetran',
    'envioDetran',
    'converterExtensao',
    'converterTamanho',
    'status',
    'acoes',
  ];
  imagens: ConfigImagem[] = [];
  dataSource = new MatTableDataSource(this.imagens);
  totalRegistros: number = 0;
  imagem: ConfigImagem;
  items$: Observable<ConfigImagem[]>;
  totalItems = 0;
  refresh$ = new Subject();
  pipe = new DatePipe('en-US');
  sortLista: string = '';
  init: boolean = false;
  childstate: boolean = false;
  readonly isLoadingResults$ = new BehaviorSubject(true);

  constructor(
    private configuracoesService: ConfiguracoesService,
    private notifierService: NotifierService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private store: Store<{ preloader: IPreloaderState }>,
  ) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) {
        this.refresh$.next(undefined);
        this.childstate = val['url'].split('configuracoes-imagens')[1]?.includes('registrar-detran') || val['url'].split('configuracoes-imagens')[1]?.includes('editar-detran');
      }
    });
  }

  ngOnInit(): void {
    this.listarImagens();
  }

  ngAfterViewInit() {
    this.carregaGridImagens();
  }

  carregaGridImagens() {
    if (this.paginator) { this.paginator.pageIndex = 0; }
    
    this.items$ = merge(this.refresh$, this.paginator.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarImagens(
          this.paginator.pageIndex,
          this.paginator.pageSize
        );
      }),
      map((result: { totalItems: number; imagens: ConfigImagem[] }) => {
        this.totalItems = result.totalItems;
        this.dataSource = new MatTableDataSource<ConfigImagem>(result.imagens);
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader())
        return result.imagens;

      }),
      catchError((err) => {
        this.isLoadingResults$.next(false);
        console.info(err);
        this.store.dispatch(closePreloader())
        return of([]);
      })
    );
  }

  listarImagens(pageIndex: number = 0, pageSize: number = 25): Observable<ObterConfigImagensResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))
    return this.configuracoesService.obterImagens(pageIndex, pageSize);
  }

  ativarInativarConfigImagem(imagemId: number, status) {
    this.store.dispatch(showPreloader({ payload: '' }))

    this.configuracoesService.ativarInativarImagem(imagemId, status).subscribe(result => {
      this.store.dispatch(closePreloader());
      if (result.isSuccessful) {
        this.notifierService.showNotification(
          `Imagem ${status ? 'ativada' : 'inativada'}`,
          'Sucesso',
          'success');
      } else {
        this.notifierService.showNotification(result.errors[0].message, 'Erro ' + result.errors[0].code, 'error');
      }
      this.refresh$.next(undefined);
    })
  }

  editarImagem(imagemId) {
    this.router.navigate(['editar-detran/', imagemId], { relativeTo: this.activatedRoute });

  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }

}
