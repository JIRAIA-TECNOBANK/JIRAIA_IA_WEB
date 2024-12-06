import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject, catchError, map, merge, of, startWith, switchMap } from 'rxjs';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { DialogAlertaConteudoComponent } from 'src/app/shared/components/dialog-alerta-conteudo/dialog-alerta-conteudo.component';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { DialogEnviarEmailComponent } from 'src/app/shared/components/dialog-enviar-email/dialog-enviar-email.component';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { TipoStatusEtapa } from '../../../../core/enums/tipo-status-etapa.enum';
import { AplicarDescontoDados } from '../../../../core/models/faturamento-conciliado/aplicar-desconto-dados.model';
import { FaturamentoConciliado } from '../../../../core/models/faturamento-conciliado/faturamento-conciliado.model';
import { FiltroConciliacao } from '../../../../core/models/faturamento-conciliado/filtro-conciliacao.model';
import { FiltroFaturado } from '../../../../core/models/faturamento-conciliado/filtro-faturado.model';
import { StatusProtheus } from '../../../../core/models/faturamento-conciliado/status-protheus.model';
import { TableConciliacao } from '../../../../core/models/faturamento-conciliado/table-conciliacao.model';
import { ObterConciliacaoResponse } from '../../../../core/responses/faturamento-conciliado/obter-conciliacao.response';
import { FaturamentoAprovacaoService } from '../../../../services/aprovacao.service';
import { FaturamentoConciliadoService } from '../../../../services/faturamento-conciliado.service';
import { DialogConsultarStatusComponent } from '../dialog-consultar-status/dialog-consultar-status.component';
import { DialogExportarArquivosComponent } from '../dialog-exportar-arquivos/dialog-exportar-arquivos.component';

@Component({
  selector: 'app-table-faturado',
  templateUrl: './table-faturado.component.html',
  styleUrls: ['./table-faturado.component.scss']
})
export class TableFaturadoComponent {

  utility = Utility;
  Permissoes = Permissoes;

  pipe = new DatePipe('en-US');
  filtro: FiltroFaturado;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Output('atualizarGrids') atualizarGrids: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input('atualizar') set atualizar(value) {
    if (this.init) {
      this.carregaGridFaturado();
    }
  }
  @Input('filtro') set setFiltro(value) {
    if (this.init) this.carregaGridFaturado(value);
    this.filtro = value;
  }

  @Input('aba') set setAba(abaFaturadoSelecionada: boolean) {
    this.abaFaturadoSelecionada = abaFaturadoSelecionada;
  }

  init: boolean = false;
  displayedColumns: string[] = [
    'selecionar',
    'empresa',
    'clienteId',
    'uf',
    'mesCompetencia',
    'valorNotaFiscal',
    'valorNotaDebito',
    'status',
    'notaFiscal',
    'notaDebito',
    'acoes'
  ];

  totalItens = 0;
  items$: Observable<TableConciliacao[]>;
  refresh$ = new Subject();
  faturado: TableConciliacao[] = [];
  dataSource = new MatTableDataSource(this.faturado);
  readonly isLoadingResults$ = new BehaviorSubject(true);
  sortFaturar: string = null;

  initialSelection = [];
  allowMultiSelect = true;
  selection = new SelectionModel<TableConciliacao>(
    this.allowMultiSelect,
    this.initialSelection
  );
  timer: NodeJS.Timeout;
  abaFaturadoSelecionada: boolean = false;

  empresaId: number = null;
  emailUsuarios: string[] = [];

  constructor(private store: Store<{ preloader: IPreloaderState }>,
    private faturamentoConciliadoService: FaturamentoConciliadoService,
    private notifierService: NotifierService,
    private router: Router,
    public dialog: MatDialog,
    private dialogService: DialogCustomService,
    private faturamentoAprovacaoService: FaturamentoAprovacaoService) { }

  ngOnInit(): void {
    this.dialogService.dialogData$.subscribe(response => {
      if (response.dataType == 'relatorios-email') {
        this.empresaId = response.data.empresaId;
        this.emailUsuarios = response.data.usuarios;
      }
    });
  }

  ngAfterViewInit() {
    Utility.watchCondition(
      this.timer,
      () => {
        if (!this.init && this.abaFaturadoSelecionada) {
          this.carregaGridFaturado();
          return true;
        }
      },
      100
    );
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }

  sortData(sort: Sort) {
    this.sortFaturar = `${sort.active}.${sort.direction}`
    this.carregaGridFaturado();
  }

  baixarArquivo(id: number, mesCompetencia: string, cnpj: string, uf: string) {
    this.store.dispatch(showPreloader({ payload: '' }));

    this.faturamentoConciliadoService.baixarConciliacao(id).subscribe(response => {
      this.store.dispatch(closePreloader());
      if (response.base64) {
        let nomeArquivo = `${Utility.checkNumbersOnly(cnpj)}_${uf}_${this.pipe.transform(mesCompetencia, 'MMyyyy')}_Arquivo`
        this.sucessoBaixar(response.base64, nomeArquivo, false);
        return;
      }

      this.notifierService.showNotification(response.errors[0].message, null, 'error');
    })
  }

  baixarNotaFiscal(id: number, mesCompetencia: string, cnpj: string, uf: string) {
    this.store.dispatch(showPreloader({ payload: '' }));

    this.faturamentoConciliadoService.baixarNotaFiscal(id).toPromise()
      .then(response => {
        this.store.dispatch(closePreloader());
        if (response.base64) {
          let nomeArquivo = `${Utility.checkNumbersOnly(cnpj)}_${uf}_${this.pipe.transform(mesCompetencia, 'MMyyyy')}_NF`
          this.sucessoBaixar(response.base64, nomeArquivo);
          return;
        }

        this.notifierService.showNotification(response.errors[0].message, null, 'error');
      })
      .catch(error => {
        this.store.dispatch(closePreloader());
        this.notifierService.showNotification(error.error.errors[0].message, null, 'error');
      })
  }

  baixarNotaDebito(id: number, mesCompetencia: string, cnpj: string, uf: string) {
    this.store.dispatch(showPreloader({ payload: '' }));

    this.faturamentoConciliadoService.baixarNotaDebito(id).toPromise()
      .then(response => {
        this.store.dispatch(closePreloader());
        if (response.base64) {
          let nomeArquivo = `${Utility.checkNumbersOnly(cnpj)}_${uf}_${this.pipe.transform(mesCompetencia, 'MMyyyy')}_ND`
          this.sucessoBaixar(response.base64, nomeArquivo);
          return;
        }

        this.notifierService.showNotification(response.errors[0].message, null, 'error');
      })
      .catch(error => {
        this.store.dispatch(closePreloader());
        this.notifierService.showNotification(error.error.errors[0].message, null, 'error');
      });
  }

  baixarTodos(id: number, mesCompetencia: string, cnpj: string, uf: string) {
    this.store.dispatch(showPreloader({ payload: '' }));

    this.faturamentoConciliadoService.baixarTodosArquivos(id).toPromise()
      .then(response => {
        this.store.dispatch(closePreloader());
        if (response.base64) {
          let nomeArquivo = `${Utility.checkNumbersOnly(cnpj)}_${uf}_${this.pipe.transform(mesCompetencia, 'MMyyyy')}_Todos`
          this.sucessoBaixar(response.base64, nomeArquivo);
          return;
        }

        this.notifierService.showNotification(response.errors[0].message, null, 'error');
      })
      .catch(error => {
        this.store.dispatch(closePreloader());
        this.notifierService.showNotification(error.error.errors[0].message, null, 'error');
      })
  }

  consultarDesconto(row: TableConciliacao) {
    if (row.valorDescontoNf > 0 || row.valorDescontoNd > 0) {
      row.descontoId = row.id;
    }

    this.faturamentoConciliadoService.retornoAplicarDescontoDados(<AplicarDescontoDados>{
      dataCompetencia: row.mesCompetencia,
      empresaNome: row.empresa,
      valorNF: row.valorNotaFiscal,
      valorND: row.valorNotaDebito,
      descontoId: row.descontoId,
      consulta: true
    });

    this.router.navigate([`/monitor-faturamento/aplicar-desconto/${row.id}`]);
  }

  checkNaoTemStatus(statusNotaProtheus: StatusProtheus[]) {
    let naoTemNotas: boolean = true;

    if (statusNotaProtheus.length == 1 && statusNotaProtheus[0] == null) return naoTemNotas;

    for (let i = statusNotaProtheus.length - 1; i >= 0; i--) {
      const obj = statusNotaProtheus[i];

      if (obj.statusNotaProtheus === "NotaFiscal" || obj.statusNotaProtheus === "NotaDebito") {
        naoTemNotas = !naoTemNotas;
        break;
      }
      return naoTemNotas;
    }
  }

  getNotas(element: TableConciliacao) {
    let notaFiscal: StatusProtheus | null = null;
    let notaDebito: StatusProtheus | null = null;
    let { empresa, clienteId, uf } = element;

    for (let i = element.statusProtheus.length - 1; i >= 0; i--) {
      const obj = element.statusProtheus[i];

      if (obj.statusNotaProtheus === "NotaFiscal") {
        notaFiscal = obj;
        break;
      } else if (obj.statusNotaProtheus === "NotaDebito") {
        notaDebito = obj;
      }
    }

    return { empresa, clienteId, uf, notaFiscal, notaDebito };
  }

  consultarStatus(element: TableConciliacao) {
    const dialogRef = this.dialog.open(DialogConsultarStatusComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'consultar-status'),
      width: '700px',
      data: this.getNotas(element)
    });

    dialogRef.beforeClosed().subscribe((confirmacao: boolean) => {
    });
  }

  openDialogEnviarEmail(element: TableConciliacao) {
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'solicitar-relatorio'),
      width: '516px',
      data: {
        component: DialogEnviarEmailComponent,
        title: '',
        empresaId: +element.clienteId,
        texto: 'as notas',
        buttonCancel: {
          value: false,
          text: 'Cancelar',
        },
        buttonConfirm: {
          value: true,
          text: 'Enviar',
        },
        disableSaveWithoutData: true,
      },
    });

    dialogRef.afterClosed().subscribe(confirmacao => {
      if (confirmacao) {
        let request = {
          id: element.id,
          emails: this.emailUsuarios
        };

        this.store.dispatch(showPreloader({ payload: '' }));
        this.emitirNotasEmail(request);
      }
    })
  }

  baixarKitCliente(element: TableConciliacao) {
    this.store.dispatch(showPreloader({ payload: '' }));

    this.faturamentoConciliadoService.baixarKitCliente(element.id).subscribe(response => {
      this.store.dispatch(closePreloader());

      if (response.base64) {
        let nomeArquivo = `${element.cnpj}-${element.uf}-${this.pipe.transform(element.mesCompetencia, 'MMyyyy')}`
        this.downloadZip(response.base64, nomeArquivo);
        this.notifierService.showNotification('Download iniciado com sucesso!', null, 'success');
        return;
      }

      this.notifierService.showNotification(response.errors[0].message, null, 'error');
    })

  }

  observacaoNFND(row: TableConciliacao) {
    this.faturamentoConciliadoService.retornoAplicarDescontoDados(<AplicarDescontoDados>{
      empresaNome: row.empresa,
      consulta: true
    });

    this.router.navigate([`/monitor-faturamento/observacao-nf-nd/${row.id}`]);
  }

  onExportarRelatorioFechamento(listaLinhas = null) {
    if (!this.filtro) this.filtro = new FiltroConciliacao();

    if (listaLinhas) { this.filtro.Ids = listaLinhas.map(l => l.id); }
    else { this.filtro.Ids = null; }
    this.filtro.ListaStatusEtapa = [TipoStatusEtapa.Faturado];

    const dialogRef = this.dialog.open(DialogExportarArquivosComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'relatorio-fechamento'),
      width: '500px',

    });

    dialogRef.beforeClosed().subscribe((confirmacao?: number) => {
      if (confirmacao != null) {
        this.store.dispatch(showPreloader({ payload: '' }));

        if (confirmacao == 0) {
          this.exportarZipRelatorio();
          return;
        }

        this.exportarUnicoRelatorio();
      }
    });
  }

  private downloadZip(base64String, fileName) {
    let source = '';
    source = `data:application/x-zip;base64,${base64String}`;

    const link = document.createElement('a');
    link.href = source;
    link.download = `${fileName}.zip`;
    link.click();
    this.store.dispatch(closePreloader())
  }

  private sucessoBaixar(base64String: string, nomeArquivo: string, pdf: boolean = true) {
    let source = `data:application/pdf;base64,${base64String}`;
    let extensao = 'pdf';

    if (!pdf) {
      source = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64String}`;
      extensao = 'xlsx';
    }

    this.downloadArquivo(source, nomeArquivo, extensao);
  }

  downloadArquivo(source: string, nome: string, extensao: string) {
    const link = document.createElement('a');
    link.href = source;
    link.download = `${nome}.${extensao}`;
    link.click();
  }

  reconciliarArquivo(element: TableConciliacao) {
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: DialogAlertaConteudoComponent,
        conteudo: `<span>Ao confirmar, o arquivo de conciliação será movido para a aba A Faturar.</span>`,
        titleClass: 'd-none',
        buttonCancel: {
          value: false,
          text: 'Cancelar',
        },
        buttonConfirm: {
          value: true,
          text: 'Confirmar',
        }
      },
    });

    dialogRef.afterClosed().subscribe(confirmacao => {

      if (confirmacao) {
        this.store.dispatch(showPreloader({ payload: '' }))
        this.reconciliar(element.id);
      }
    })
  }

  exportarTodos(listaLinhas = null) {
    if (!this.filtro) this.filtro = new FiltroConciliacao();

    if (listaLinhas) { this.filtro.Ids = listaLinhas.map(l => l.id); }
    else { this.filtro.Ids = null; }
    this.filtro.ListaStatusEtapa = [TipoStatusEtapa.Faturado];

    const dialogRef = this.dialog.open(DialogExportarArquivosComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'exportar-arquivos'),
      width: '500px',

    });

    dialogRef.beforeClosed().subscribe((confirmacao?: number) => {
      if (confirmacao != null) {
        this.store.dispatch(showPreloader({ payload: '' }));

        if (confirmacao == 0) {
          this.exportarZip();
          return;
        }

        this.exportarUnico();
      }
    });
  }

  reenviarNF(id: number) {
    this.store.dispatch(showPreloader({ payload: '' }));

    this.faturamentoConciliadoService.reenviarNF(id).subscribe({
      next: (response) => {
        this.store.dispatch(closePreloader());

        if (response.reenviado) {
          this.notifierService.showNotification('Reenvio de NF realizado com sucesso.', null, 'success');
          return;
        }

        this.notifierService.showNotification(response.errors[0].message, null, 'error');
      },
      error: (erro) => {
        this.notifierService.showNotification('Houve um erro interno.', null, 'error');
        this.store.dispatch(closePreloader());
      }
    })
  }

  reenviarND(id: number) {
    this.store.dispatch(showPreloader({ payload: '' }));

    this.faturamentoConciliadoService.reenviarND(id).subscribe({
      next: (response) => {
        this.store.dispatch(closePreloader());

        if (response.reenviado) {
          this.notifierService.showNotification('Reenvio de ND realizado com sucesso.', null, 'success');
          return;
        }

        this.notifierService.showNotification(response.errors[0].message, null, 'error');
      },
      error: (erro) => {
        this.notifierService.showNotification('Houve um erro interno.', null, 'error');
        this.store.dispatch(closePreloader());
      }
    })
  }

  cancelarNF(id: number) {
    this.store.dispatch(showPreloader({ payload: '' }));

    this.faturamentoAprovacaoService.solicitarCancelamentoNF(id).subscribe({
      next: (response) => {
        this.store.dispatch(closePreloader());

        if (response.solicitado) {
          this.notifierService.showNotification('Solicitação de cancelamento de NF realizado com sucesso.', null, 'success');
          return;
        }

        this.notifierService.showNotification(response.errors[0].message, null, 'error');
      },
      error: (erro) => {
        this.notifierService.showNotification('Houve um erro interno.', null, 'error');
        this.store.dispatch(closePreloader());
      }
    })
  }

  cancelarND(id: number) {
    this.store.dispatch(showPreloader({ payload: '' }));

    this.faturamentoAprovacaoService.solicitarCancelamentoND(id).subscribe({
      next: (response) => {
        this.store.dispatch(closePreloader());

        if (response.solicitado) {
          this.notifierService.showNotification('Solicitação de cancelamento de ND realizado com sucesso.', null, 'success');
          return;
        }

        this.notifierService.showNotification(response.errors[0].message, null, 'error');
      },
      error: (erro) => {
        this.notifierService.showNotification('Houve um erro interno.', null, 'error');
        this.store.dispatch(closePreloader());
      }
    })
  }

  onBaixarRelatorioFechamento(id: number) {
    this.store.dispatch(showPreloader({ payload: '' }));
    this.exportarUnicoRelatorio([id]);
  }

  private exportarZip() {
    let base64: string;

    this.faturamentoConciliadoService.baixarTodosArquivosGrid(this.filtro.Ids).subscribe({
      next: (response) => {
        base64 = response.base64;
      },
      complete: () => {
        this.tratarRespostaDownload(base64, 'arquivos-faturado', 'application/x-zip', 'zip');
      },
      error: (erro) => {
        this.notifierService.showNotification(erro[0].message, null, 'error');
        this.store.dispatch(closePreloader());
      }
    });
  }

  private exportarUnico() {
    let base64: string;

    this.faturamentoConciliadoService.baixarArquivoUnicoGrid(this.filtro.Ids).subscribe({
      next: (response) => {
        base64 = response.base64;
      },
      complete: () => {
        this.tratarRespostaDownload(base64, 'arquivo-unico-faturado', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx');
      },
      error: (erro) => {
        this.notifierService.showNotification(erro[0].message, null, 'error');
        this.store.dispatch(closePreloader());
      }
    });
  }

  private exportarZipRelatorio() {
    let base64: string;

    this.faturamentoConciliadoService.baixarRelatorioFechamento(this.filtro.Ids).subscribe({
      next: (response) => {
        base64 = response.base64;
      },
      complete: () => {
        this.tratarRespostaDownload(base64, 'relatorio-fechamento', 'relatorio-fechamento', 'zip');
      },
      error: (erro) => {
        this.notifierService.showNotification(erro[0].message, null, 'error');
        this.store.dispatch(closePreloader());
      }
    });
  }

  private exportarUnicoRelatorio(ids: number[] = null) {
    let base64: string;

    if (ids == null) ids = this.filtro.Ids;

    this.faturamentoConciliadoService.baixarRelatorioFechamentoUnico(ids).subscribe({
      next: (response) => {
        base64 = response.base64;
      },
      complete: () => {
        this.tratarRespostaDownload(base64, 'relatorio-fechamento-unico', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx');
      },
      error: (erro) => {
        this.notifierService.showNotification(erro[0].message, null, 'error');
        this.store.dispatch(closePreloader());
      }
    });
  }

  private tratarRespostaDownload(base64: string, nomeArquivo: string, mimeType: string, extensao: string) {
    this.download(base64, nomeArquivo, mimeType, extensao);
    this.notifierService.showNotification('Download iniciado com sucesso!', null, 'success');
  }

  private download(base64String, fileName, mimetype, extension) {
    let source = '';
    source = `data:${mimetype};base64,${base64String}`;

    const link = document.createElement('a');
    link.href = source;
    link.download = `${fileName}.${extension}`;
    link.click();
    this.store.dispatch(closePreloader())
  }

  private reconciliar(id: number) {
    this.faturamentoConciliadoService.reconciliarArquivo(id).subscribe(response => {
      this.store.dispatch(closePreloader())

      if (response.flag) {
        this.notifierService.showNotification('Arquivo movido para aba A Faturar.', null, 'success');
        this.recarregarGrid();
        return;
      }

      this.notifierService.showNotification(response.msg, null, 'error');
    });
  }

  private recarregarGrid() {
    this.refresh$.next(null);
    this.selection.clear();
    this.atualizarGrids.emit(true);
  }

  private carregaGridFaturado(filtros: FiltroFaturado = null) {
    this.selection.clear();

    if (this.paginator) { this.paginator.pageIndex = 0; }

    this.items$ = merge(this.refresh$, this.paginator?.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarFaturado(this.paginator?.pageIndex, this.paginator?.pageSize, this.sortFaturar, filtros);
      }),
      map((result: { faturamentoConciliados: FaturamentoConciliado }) => {
        this.totalItens = result.faturamentoConciliados.totalCount;
        this.dataSource = new MatTableDataSource<TableConciliacao>(result.faturamentoConciliados.items);
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader())

        return result.faturamentoConciliados.items;
      }),
      catchError((err) => {
        this.isLoadingResults$.next(false);
        console.info(err);
        this.store.dispatch(closePreloader())
        return of([]);
      })
    );
    this.init = true;
  }

  private listarFaturado(pageIndex: number = 0, pageSize: number = 25, sort: string = null, filtros: FiltroFaturado = null): Observable<ObterConciliacaoResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))
    return this.faturamentoConciliadoService.obterTableFaturado(pageIndex, pageSize, sort, filtros);
  }

  private emitirNotasEmail(request) {
    this.faturamentoConciliadoService.emitirEmail(request).subscribe(response => {
      this.store.dispatch(closePreloader());
      if (response.success) {
        this.notifierService.showNotification('Arquivo enviado com sucesso!', '', 'success');
        return;
      }

      this.notifierService.showNotification(response.errors[0].message, '', 'error');
    })
  }
}
