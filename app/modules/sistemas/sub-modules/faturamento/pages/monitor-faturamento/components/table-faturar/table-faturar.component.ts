import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
import { TableConciliacao } from '../../../../core/models/faturamento-conciliado/table-conciliacao.model';
import { AprovarFaturamentoRequest } from '../../../../core/requests/faturamento-conciliado/aprovar-faturamento.request';
import { ObterConciliacaoResponse } from '../../../../core/responses/faturamento-conciliado/obter-conciliacao.response';
import { FaturamentoConciliadoService } from '../../../../services/faturamento-conciliado.service';
import { DialogExportarArquivosComponent } from '../dialog-exportar-arquivos/dialog-exportar-arquivos.component';
import { DialogInformativoComponent } from '../dialog-informativo/dialog-informativo.component';

@Component({
  selector: 'app-table-faturar',
  templateUrl: './table-faturar.component.html',
  styleUrls: ['./table-faturar.component.scss']
})
export class TableFaturarComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  pipe = new DatePipe('en-US');
  empresaId: number = null;
  emailUsuarios: string[] = [];
  filtro: FiltroConciliacao;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Output('atualizarGrids') atualizarGrids: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input('atualizar') set atualizar(value) {
    if (this.init) {
      this.carregaGridFaturar();
    }
  }
  @Input('filtro') set setFiltro(value) {
    if (this.init) this.carregaGridFaturar(value);
    this.filtro = value;
  }

  @Input('aba') set setAba(abaFaturarSelecionada: boolean) {
    this.abaFaturarSelecionada = abaFaturarSelecionada;
  }

  init: boolean = false;
  displayedColumns: string[] = [
    'selecionar',
    'empresa',
    'clienteId',
    'uf',
    'mesCompetencia',
    'quantidadeOperacoes',
    'quantidadeReembolsar',
    'valorNotaFiscal',
    'valorNotaDebito',
    'descontoNF',
    'descontoND',
    'status',
    'acoes'
  ];

  totalItens = 2;
  items$: Observable<TableConciliacao[]>;
  refresh$ = new Subject();
  conciliacaoItens: TableConciliacao[] = [];
  dataSource = new MatTableDataSource(this.conciliacaoItens);
  readonly isLoadingResults$ = new BehaviorSubject(true);
  sortFaturar: string = null;

  initialSelection = [];
  allowMultiSelect = true;
  selection = new SelectionModel<TableConciliacao>(
    this.allowMultiSelect,
    this.initialSelection
  );

  timer: NodeJS.Timeout;
  abaFaturarSelecionada: boolean = false;

  constructor(private store: Store<{ preloader: IPreloaderState }>,
    private faturamentoConciliadoService: FaturamentoConciliadoService,
    private notifierService: NotifierService,
    private router: Router,
    public dialog: MatDialog,
    private dialogService: DialogCustomService) { }

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
        if (!this.init && this.abaFaturarSelecionada) {
          this.carregaGridFaturar();
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
    this.carregaGridFaturar();
  }

  aplicarDesconto(row: TableConciliacao) {
    if (row.valorDescontoNf > 0 || row.valorDescontoNd > 0) {
      row.descontoId = row.id;
    }

    this.faturamentoConciliadoService.retornoAplicarDescontoDados(<AplicarDescontoDados>{
      dataCompetencia: row.mesCompetencia,
      empresaNome: row.empresa,
      valorNF: row.valorNotaFiscal,
      valorND: row.valorNotaDebito,
      descontoId: row.descontoId
    });

    this.router.navigate([`/monitor-faturamento/aplicar-desconto/${row.id}`]);
  }

  cancelarDesconto(row: TableConciliacao) {
    if (row.valorDescontoNf > 0 || row.valorDescontoNd > 0) {
      this.store.dispatch(showPreloader({ payload: '' }));
      this.faturamentoConciliadoService.cancelarDesconto(row.id).subscribe(response => {
        if (response.isSuccessful) {
          this.notifierService.showNotification('Desconto cancelado com sucesso!', null, 'success');
          this.refresh$.next(null);
          return;
        }

        this.notifierService.showNotification(response.errors[0].message, null, 'error');
        this.store.dispatch(closePreloader());
      })

    }
  }

  observacaoNFND(row: TableConciliacao) {
    this.faturamentoConciliadoService.retornoAplicarDescontoDados(<AplicarDescontoDados>{
      empresaNome: row.empresa
    });

    this.router.navigate([`/monitor-faturamento/observacao-nf-nd/${row.id}`]);
  }

  onAprovar(id: number = null) {
    let mensagem = `<p>Após a aprovação, as informações serão encaminhadas ao Protheus para emissão da nota fiscal, e quando aplicável, emitirá também, a nota de débito.</p>
        <div class="info-warning mr-2 w-100 d-flex" fxLayout="row" fxLayoutGap="15px"><i
            class="fa-regular fa-memo-circle-info"></i>
          <section class="ml-1">
            <p class="bold mt-0">IMPORTANTE</p>
            <ul class="pl-2">
                <li>
                    <p class="bold">Em caso de desconto, atente-se para aplicá-lo antes de aprovar esse faturamento, evitando o cancelamento de notas.</p>
                </li>
            </ul>
          </section>
        </div>
        <p>Confirma a aprovação?</p>`;

    const dialogRef = this.dialog.open(DialogCustomComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'informativo'),
      width: '550px',
      data: {
        component: DialogInformativoComponent,
        mensagemModal: mensagem,
        buttonCancel: {
          value: false,
          text: 'Cancelar',
        },
        buttonConfirm: {
          value: true,
          text: 'Confirmar',
        },
      }
    });

    dialogRef.beforeClosed().subscribe((confirmacao: boolean) => {
      if (!confirmacao) return; // cancelar

      this.store.dispatch(showPreloader({ payload: '' }));
      this.aprovarEnviar(id);
    });
  }

  private aprovarEnviar(id: number = null) {
    let request = <AprovarFaturamentoRequest>{
      conciliacaoItemIds: id == null ? this.selection.selected.map(s => s.id) : [id]
    };

    this.faturamentoConciliadoService.aprovarEnviarFaturamento(request).subscribe(response => {
      this.recarregarGrid();
      this.store.dispatch(closePreloader());

      if (response.aprovado) {
        this.notifierService.showNotification('Pedido de cobrança iniciado com sucesso.', null, 'success');
        this.recarregarGrid();
        return;
      }

      this.aprovacaoNegada();
    })
  }

  private aprovacaoNegada() {
    this.dialog.open(DialogCustomComponent, {
      width: '520px',
      data: {
        component: DialogAlertaConteudoComponent,
        conteudo: `<span class="bold">Arquivo(s) não recebido(s) com sucesso pelo Protheus.</span>

                  <span>É necessário o reenvio desse(s) arquivo(s) para prosseguir com o faturamento dele(s).</span>`,
        titleClass: 'd-none',
        buttonsAlign: "center",
        buttonConfirm: {
          value: true,
          text: '    OK    ',
        },
        disableSaveWithoutData: true
      },
    });
  }

  baixarArquivoConciliacao(id: number, mesCompetencia: string, cnpj: string) {
    this.store.dispatch(showPreloader({ payload: '' }));

    this.faturamentoConciliadoService.baixarConciliacao(id).subscribe(response => {
      this.store.dispatch(closePreloader());
      if (response.base64) {
        let nomeArquivo = `${Utility.checkNumbersOnly(cnpj)}_${this.pipe.transform(mesCompetencia, 'MMyyyy')}_Arquivo`
        this.downloadArquivo(`data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${response.base64}`, nomeArquivo, 'xlsx');
        return;
      }

      this.notifierService.showNotification(response.errors[0].message, null, 'error');
      this.store.dispatch(closePreloader());
    })
  }

  downloadArquivo(source: string, nome: string, extensao: string) {
    const link = document.createElement('a');
    link.href = source;
    link.download = `${nome}.${extensao}`;
    link.click();
  }

  openDialogEnviarEmail(element: TableConciliacao) {
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'solicitar-relatorio'),
      width: '516px',
      data: {
        component: DialogEnviarEmailComponent,
        title: '',
        empresaId: +element.clienteId,
        texto: 'o arquivo',
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
          cnpj: element.cnpj,
          mesAno: this.pipe.transform(element.mesCompetencia, 'MMyyyy'),
          emails: this.emailUsuarios
        };

        this.store.dispatch(showPreloader({ payload: '' }));

        this.emitirArquivoEmail(request);
      }
    })
  }

  exportarTodos(listaLinhas = null) {
    if (!this.filtro) this.filtro = new FiltroConciliacao();

    if (listaLinhas) { this.filtro.Ids = listaLinhas.map(l => l.id); }
    else { this.filtro.Ids = null; }
    this.filtro.ListaStatusEtapa = [TipoStatusEtapa.AFaturar];

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

  retornarAbaAnterior(listaLinhas: TableConciliacao[]) {
    this.store.dispatch(closePreloader());
    let idsConciliacao = listaLinhas.map(l => l.id);

    this.faturamentoConciliadoService.retornarConciliacaoAbaAnterior(idsConciliacao).subscribe(response => {
      if (response.flag) {
        this.notifierService.showNotification(response.msg, null, 'success');
        this.recarregarGrid();
        return;
      }

      this.notifierService.showNotification(response.msg, null, 'error');
    })
  }

  retornarTooltip(linha: TableConciliacao) {
    let tooltip = "";

    if (linha.isConciliadoForaPrazo) {
      tooltip += `Arquivo conciliado fora do prazo esperado, posterior ao 3º dia do mês.
      
      `;
    }

    if (linha.reenviarFaturar) {
      tooltip += "Arquivo não recebido pelo Protheus, necessário reenvio."
    }

    return tooltip;
  }

  onExportarRelatorioFechamento(listaLinhas = null) {
    if (!this.filtro) this.filtro = new FiltroConciliacao();

    if (listaLinhas) { this.filtro.Ids = listaLinhas.map(l => l.id); }
    else { this.filtro.Ids = null; }
    this.filtro.ListaStatusEtapa = [TipoStatusEtapa.Conciliacao];

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

  private exportarZip() {
    let base64: string;

    this.faturamentoConciliadoService.baixarTodosArquivosGrid(this.filtro.Ids).subscribe({
      next: (response) => {
        base64 = response.base64;
      },
      complete: () => {
        this.tratarRespostaDownload(base64, 'arquivos-faturar', 'application/x-zip', 'zip');
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
        this.tratarRespostaDownload(base64, 'arquivo-unico-faturar', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx');
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
        this.tratarRespostaDownload(base64, 'relatorio-pre-fechamento', 'relatorio-fechamento', 'zip');
      },
      error: (erro) => {
        this.notifierService.showNotification(erro[0].message, null, 'error');
        this.store.dispatch(closePreloader());
      }
    });
  }

  private exportarUnicoRelatorio() {
    let base64: string;

    this.faturamentoConciliadoService.baixarRelatorioFechamentoUnico(this.filtro.Ids).subscribe({
      next: (response) => {
        base64 = response.base64;
      },
      complete: () => {
        this.tratarRespostaDownload(base64, 'relatorio-pre-fechamento-unico', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx');
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

  // private exportarZip() {
  //   this.faturamentoConciliadoService.baixarTodosArquivosGrid(this.filtro.Ids).subscribe(response => {
  //     if (response.base64) {
  //       this.download(response.base64, 'arquivos-faturar', 'application/x-zip', 'zip');
  //       this.notifierService.showNotification('Download iniciado com sucesso!', null, 'success');
  //       return;
  //     }

  //     this.notifierService.showNotification(response.errors[0].message, null, 'error');
  //     this.store.dispatch(closePreloader());
  //   }, error => {
  //     this.notifierService.showNotification('Houve um erro interno.', null, 'error');
  //     this.store.dispatch(closePreloader())
  //   })
  // }

  // private exportarUnico() {
  //   this.faturamentoConciliadoService.baixarArquivoUnicoGrid(this.filtro.Ids).subscribe(response => {
  //     if (response.base64) {
  //       this.download(response.base64, 'arquivo-unico-faturar', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx');
  //       this.notifierService.showNotification('Download iniciado com sucesso!', null, 'success');
  //       return;
  //     }

  //     this.notifierService.showNotification(response.errors[0].message, null, 'error');
  //     this.store.dispatch(closePreloader());
  //   }, error => {
  //     this.notifierService.showNotification('Houve um erro interno.', null, 'error');
  //     this.store.dispatch(closePreloader())
  //   })
  // }

  private download(base64String, fileName, mimetype, extension) {
    let source = '';
    source = `data:${mimetype};base64,${base64String}`;

    const link = document.createElement('a');
    link.href = source;
    link.download = `${fileName}.${extension}`;
    link.click();
    this.store.dispatch(closePreloader())
  }

  private recarregarGrid() {
    this.refresh$.next(null);
    this.selection.clear();
    this.atualizarGrids.emit(true);
  }

  private reconciliar(id: number) {
    this.faturamentoConciliadoService.reconciliarArquivo(id).subscribe(response => {
      this.store.dispatch(closePreloader())

      if (response.flag) {
        this.notifierService.showNotification('Arquivo movido para aba Conciliação.', null, 'success');
        this.recarregarGrid();
        return;
      }

      this.notifierService.showNotification(response.msg, null, 'error');
    });
  }

  reconciliarArquivo(element: TableConciliacao) {
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: DialogAlertaConteudoComponent,
        conteudo: `<span>Ao confirmar, o arquivo de conciliação será movido para a aba Conciliação e não será
        enviado nesse momento para o Faturamento.</span>`,
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

  private carregaGridFaturar(filtros: FiltroConciliacao = null) {
    this.selection.clear();

    if (this.paginator) { this.paginator.pageIndex = 0; }

    this.items$ = merge(this.refresh$, this.paginator?.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarFaturar(this.paginator?.pageIndex, this.paginator?.pageSize, this.sortFaturar, filtros);
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
        this.totalItens = 0;
        this.store.dispatch(closePreloader())
        return of([]);
      })
    );
    this.init = true;
  }

  private listarFaturar(pageIndex: number = 0, pageSize: number = 25, sort: string = null, filtros: FiltroConciliacao = null): Observable<ObterConciliacaoResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))
    return this.faturamentoConciliadoService.obterTableFaturar(pageIndex, pageSize, sort, filtros);
  }

  private emitirArquivoEmail(request) {
    this.faturamentoConciliadoService.emitirEmailArquivoConciliacao(request).subscribe(response => {
      this.store.dispatch(closePreloader());
      if (response.success) {
        this.notifierService.showNotification('Arquivo enviado com sucesso!', '', 'success');
        return;
      }

      this.notifierService.showNotification(response.errors[0].message, '', 'error');
    }, () => {
      this.notifierService.showNotification('Houve um erro interno.', '', 'error');
      this.store.dispatch(closePreloader());
    })
  }
}
