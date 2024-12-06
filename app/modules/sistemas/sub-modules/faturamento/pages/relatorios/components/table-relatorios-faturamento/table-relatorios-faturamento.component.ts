import { Component, Input, ViewChild } from '@angular/core';

import { DatePipe, registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Sort } from '@angular/material/sort';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject, catchError, map, merge, of, startWith, switchMap } from 'rxjs';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { Usuario } from 'src/app/modules/sistemas/sub-modules/admin/core/models/usuarios/usuarios.model';
import { UsuariosService } from 'src/app/modules/sistemas/sub-modules/admin/services/usuarios.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { TipoFormatoRelatorioFaturamentoDesc } from '../../../../core/common/tipo-formato-relatorio-faturamento-desc';
import { TipoModeloRelatorioFaturamentoDesc } from '../../../../core/common/tipo-modelo-relatorio-faturamento-desc';
import { TipoStatusRelatorioFaturamentoDesc } from '../../../../core/common/tipo-status-relatorio-faturamento';
import { TipoFormatoRelatorioFaturamento } from '../../../../core/enums/tipo-formato-relatorio-faturamento.enum';
import { TipoModeloRelatorioFaturamento } from '../../../../core/enums/tipo-modelo-relatorio-faturamento.enum';
import { TipoStatusRelatorioFaturamento } from '../../../../core/enums/tipo-status-relatorio-faturamento.enum';
import { FiltroRelatoriosFaturamento } from '../../../../core/models/relatorios/filtro-relatorios.model';
import { RelatorioFaturamento } from '../../../../core/models/relatorios/relatorio-faturamento.model';
import { SolicitacaoRelatorioItem } from '../../../../core/models/relatorios/solicitacao-relatorio-item.model';
import { ObterRelatorioFinanceiroPaginadoResponse } from '../../../../core/responses/relatorios/obter-relatorio-financeiro-paginado.response';
import { RelatorioFinanceiroService } from '../../../../services/relatorio-financeiro.service';

registerLocaleData(ptBr);

@Component({
  selector: 'app-table-relatorios-faturamento',
  templateUrl: './table-relatorios-faturamento.component.html',
  styleUrls: ['./table-relatorios-faturamento.component.scss']
})
export class TableRelatoriosFaturamentoComponent {

  utility = Utility;
  Permissoes = Permissoes;

  pipe = new DatePipe('en-US');
  filtro: FiltroRelatoriosFaturamento;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Input('atualizar') set atualizar(value) {
    if (this.init) {
      this.carregaGridRelatorios();
    }
  }
  @Input('filtro') set setFiltro(filtros: FiltroRelatoriosFaturamento) {
    this.filtro = filtros;
    if (this.init) this.carregaGridRelatorios();
  }


  init: boolean = false;
  displayedColumns: string[] = [
    'empresa',
    'modelo',
    'uf',
    'formato',
    'mes',
    'ano',
    'dataSolicitacao',
    'solicitante',
    'status',
    'acoes'
  ];

  totalItens = 0;
  items$: Observable<RelatorioFaturamento[]>;
  refresh$ = new Subject();
  relatoriosItens: RelatorioFaturamento[] = [];
  dataSource = new MatTableDataSource(this.relatoriosItens);
  readonly isLoadingResults$ = new BehaviorSubject(true);
  sortRelatorios: string = null;

  usuarios: Usuario[] = [];

  constructor(private store: Store<{ preloader: IPreloaderState }>,
    private relatorioService: RelatorioFinanceiroService,
    private usuariosService: UsuariosService,
    private notifierService: NotifierService) { }

  ngAfterViewInit() {
    this.carregaGridRelatorios();
    this.init = true;
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }

  sortData(sort: Sort) {
    this.sortRelatorios = `${sort.active}.${sort.direction}`
    this.carregaGridRelatorios();
  }

  retornarNomeMes(data: Date) {
    const date = new Date(data);
    let mesNome = date.toLocaleString('pt-BR', {
      month: 'long',
    });

    return mesNome[0].toUpperCase() + mesNome.slice(1);
  }

  retornarModelo(modeloId: TipoModeloRelatorioFaturamento) {
    return TipoModeloRelatorioFaturamentoDesc.get(modeloId) || TipoModeloRelatorioFaturamentoDesc.get(TipoModeloRelatorioFaturamento.Fechamento);
  }

  retornarFormato(formatoId: TipoFormatoRelatorioFaturamento) {
    return TipoFormatoRelatorioFaturamentoDesc.get(formatoId);
  }

  retornarStatus(statusId: TipoStatusRelatorioFaturamento) {
    return TipoStatusRelatorioFaturamentoDesc.get(statusId);
  }

  baixarRelatorio(element: RelatorioFaturamento) {
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.href = element.url;
    a.download = `${element.uf}_${element.empresaId}_${this.pipe.transform(element.periodoRelatorio, 'MMyyyy')}`;
    a.click();
    document.body.removeChild(a);
    this.notifierService.showNotification('Arquivo baixado com sucesso.', null, 'success');
  }

  retornarNomeCompleto(row: RelatorioFaturamento) {
    if (row.usuarioId > 0) {
      return `${row.primeiroNomeUsuario || ''} ${row.sobreNomeUsuario || ''}`;
    }

    return 'Usuário externo';
  }

  private carregaGridRelatorios() {
    if (this.paginator) { this.paginator.pageIndex = 0; }

    this.items$ = merge(this.refresh$, this.paginator?.page).pipe(
      startWith({}),
      switchMap(() => {
        return this.listarSolicitacoesRelatorio(this.paginator.pageIndex, this.paginator.pageSize);
      }),
      map((result: { solicitacaoRelatorios: SolicitacaoRelatorioItem }) => {
        this.totalItens = result.solicitacaoRelatorios.totalCount;
        this.store.dispatch(closePreloader());
        this.store.dispatch(closePreloader());
        return result.solicitacaoRelatorios.items;
      }),
      catchError((err) => {
        console.info(err);
        this.store.dispatch(closePreloader());
        return of([]);
      })
    );
  }

  private listarSolicitacoesRelatorio(pageIndex: number = 0, pageSize: number = 25): Observable<ObterRelatorioFinanceiroPaginadoResponse> {
    this.store.dispatch(showPreloader({ payload: '' }));
    return this.relatorioService.obterSolicitacoesRelatorio(pageIndex, pageSize, this.filtro);
  }
}
