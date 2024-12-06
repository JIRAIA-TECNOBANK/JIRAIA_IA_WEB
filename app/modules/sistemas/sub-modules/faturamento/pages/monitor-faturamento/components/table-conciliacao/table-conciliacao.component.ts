import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe, registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Sort } from '@angular/material/sort';
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
import { ConciliacaoItem } from '../../../../core/models/faturamento-conciliado/conciliacao-item.model';
import { FaturamentoConciliado } from '../../../../core/models/faturamento-conciliado/faturamento-conciliado.model';
import { FiltroConciliacao } from '../../../../core/models/faturamento-conciliado/filtro-conciliacao.model';
import { TableConciliacao } from '../../../../core/models/faturamento-conciliado/table-conciliacao.model';
import { AprovarConciliacaoRequest } from '../../../../core/requests/faturamento-conciliado/aprovar-conciliacao.request';
import { ExcluirCobrancaRequest } from '../../../../core/requests/faturamento-conciliado/excluir-cobranca.request';
import { ObterConciliacaoResponse } from '../../../../core/responses/faturamento-conciliado/obter-conciliacao.response';
import { FaturamentoConciliadoService } from '../../../../services/faturamento-conciliado.service';
import { DialogExcluirDuplicidadeComponent } from '../../pages/detalhar-pendencias/components/dialog-excluir-duplicidade/dialog-excluir-duplicidade.component';
import { DialogExportarArquivosComponent } from '../dialog-exportar-arquivos/dialog-exportar-arquivos.component';
import { DialogInformativoComponent } from '../dialog-informativo/dialog-informativo.component';
import { ExcluirCobrancaComponent } from '../excluir-cobranca/excluir-cobranca.component';

registerLocaleData(ptBr);

@Component({
  selector: 'app-table-conciliacao',
  templateUrl: './table-conciliacao.component.html',
  styleUrls: ['./table-conciliacao.component.scss']
})
export class TableConciliacaoComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  pipe = new DatePipe('en-US');
  filtro: FiltroConciliacao;
  empresaId: number = null;
  emailUsuarios: string[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Output('atualizarGrids') atualizarGrids: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input('atualizar') set atualizar(value) {
    if (this.init) {
      this.carregaGridConciliacao();
    }
  }
  @Input('filtro') set setFiltro(value) {
    this.carregaGridConciliacao(value);
    this.filtro = value;
  }

  @Input('aba') set setAba(abaConciliacaoSelecionada: boolean) {
    this.abaConciliacaoSelecionada = abaConciliacaoSelecionada;
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
    'status',
    'acoes'
  ];

  totalItens = 0;
  items$: Observable<TableConciliacao[]>;
  refresh$ = new Subject();
  conciliacaoItens: TableConciliacao[] = [];
  dataSource = new MatTableDataSource(this.conciliacaoItens);
  readonly isLoadingResults$ = new BehaviorSubject(true);
  sortConciliacao: string = null;

  initialSelection = [];
  allowMultiSelect = true;
  selection = new SelectionModel<TableConciliacao>(
    this.allowMultiSelect,
    this.initialSelection
  );

  timer: NodeJS.Timeout;
  abaConciliacaoSelecionada: boolean = false;

  constructor(private store: Store<{ preloader: IPreloaderState }>,
    private faturamentoConciliadoService: FaturamentoConciliadoService,
    private notifierService: NotifierService,
    private dialog: MatDialog,
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
        if (!this.init && this.abaConciliacaoSelecionada) {
          this.carregaGridConciliacao();
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

  desabilitarCheckboxSelecionarTodos() {
    let status = Array.from(new Set(this.dataSource.data.map(d => d.statusFaturamentoConciliado.descricao)));
    let aprovarLinhas = this.dataSource.data.map(s => s.aprovar).length;
    return !(aprovarLinhas === this.dataSource.data.length && !status.includes('Aguardando Revisão'))
  }

  desabilitarCheckbox() {
    return this.selection.selected?.filter((s) => s.statusFaturamentoConciliado.descricao === 'Aguardando Revisão' && s.aprovar)?.length > 0;
  }

  habilitarAprovar() {
    if (this.selection.selected.length == 0) return false;

    let status = Array.from(new Set(this.selection.selected.map(d => d.statusFaturamentoConciliado.descricao)));
    let aprovarLinhas = this.selection.selected.map(s => s.aprovar).length;

    // somente posso aprovar uma conciliacao Aguardando revisao por vez e que tenha o campo aprovar = true
    if (this.selection.selected.length === 1
      && this.selection.selected[0].statusFaturamentoConciliado.descricao === 'Aguardando Revisão'
      && this.selection.selected[0].aprovar) return true;

    return (aprovarLinhas === this.selection.selected.length && !status.includes('Aguardando Revisão'))
  }

  onAprovar() {
    if (this.selection.selected[0].statusFaturamentoConciliado.descricao === 'Aguardando Revisão') {
      this.validarAguardandoRevisao();
      return;
    }

    this.aprovarSelecionados();
  }

  regerarConciliacao() {
    this.store.dispatch(showPreloader({ payload: '' }));
    let ids = this.selection.selected.map(l => l.id);

    this.faturamentoConciliadoService.regerarConciliacao(ids).subscribe(response => {
      this.store.dispatch(closePreloader());

      if (response.success) {
        this.refresh$.next(null);
        this.selection.clear();
        this.atualizarGrids.emit(true);
        this.notifierService.showNotification('Conciliação gerada novamente com sucesso!', null, 'success');
      }
    });
  }

  exportarTodos(listaLinhas = null) {
    if (!this.filtro) this.filtro = new FiltroConciliacao();

    if (listaLinhas) { this.filtro.Ids = listaLinhas.map(l => l.id); }
    else { this.filtro.Ids = null; }
    this.filtro.ListaStatusEtapa = [TipoStatusEtapa.Conciliacao];

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
        this.tratarRespostaDownload(base64, 'arquivos-concilicao', 'application/x-zip', 'zip');
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
        this.tratarRespostaDownload(base64, 'arquivo-unico-conciliacao', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx');
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

  private download(base64String, fileName, mimetype, extension) {
    let source = '';
    source = `data:${mimetype};base64,${base64String}`;

    const link = document.createElement('a');
    link.href = source;
    link.download = `${fileName}.${extension}`;
    link.click();
    this.store.dispatch(closePreloader())
  }

  private validarAguardandoRevisao() {
    let mensagem = `<p>
    Quando aprovado um arquivo com status "Aguardado revisão", ele será dividido em duas partes.<br>
    <br>
    Um arquivo irá conter os contratos conciliados com sucesso e pode ser aprovado de imediato para a faturar. 
    Já o segundo arquivo irá conter os contratos pendentes de revisão, e somente após esse segundo arquivo receber as devidas 
    tratativas é que poderá ser aprovado para "A faturar".<br>
    <br>
    Quando ocorrer esse cenário, após a aprovação para o faturamento, serão emitidas duas notas de cobrança: uma para cada arquivo.<br>
    <br>
    Essa ação é irreversível.<br>
    <br>
    <b>Confirma a aprovação?</b>
    </p>`;

    const dialogRef = this.dialog.open(DialogCustomComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'informativo'),
      width: '500px',
      height: '',
      data: {
        component: DialogInformativoComponent,
        title: '',
        mensagemModal: mensagem,
        buttonCancel: {
          value: false,
          text: 'Cancelar',
        },
        buttonConfirm: {
          value: true,
          text: 'Confirmar',
        },
        disableSaveWithoutData: true,
      },
      autoFocus: false
    });

    dialogRef.beforeClosed().subscribe((confirmacao: boolean) => {
      if (confirmacao) {
        this.aprovarSelecionados(true);
      }
    });
  }

  private aprovarSelecionados(separarArquivos: boolean = false) {
    this.store.dispatch(showPreloader({ payload: '' }));
    let request: AprovarConciliacaoRequest = {
      ids: this.selection.selected.map(s => s.id)
    }

    this.faturamentoConciliadoService.aprovarConciliacao(request).subscribe(response => {
      if (response.aprovado) {
        let mensagem = `Conciliaç${this.selection.selected.length > 1 ? 'ões' : 'ão'} aprovada${this.selection.selected.length > 1 ? 's' : ''} com sucesso! Consulte a aba "A faturar".`;
        if (separarArquivos) { mensagem = 'Arquivo separado com sucesso.'; }

        this.notifierService.showNotification(mensagem, null, 'success');
        this.refresh$.next(null);
        this.selection.clear();
        this.atualizarGrids.emit(true);
      }
      else {
        let mensagem = response?.errors[0]?.message || 'Não foi possível realizar a aprovação.';
        this.notifierService.showNotification(mensagem, null, 'error');
      }

      this.store.dispatch(closePreloader());
    });
  }

  onExcluirCobranca(item: TableConciliacao) {
    const dialogRef = this.dialog.open(ExcluirCobrancaComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'info'),
      width: '809px',
      data: {
        id: item.id,
        empresa: item.empresa,
        clienteId: item.clienteId,
        uf: item.uf
      },
    });

    dialogRef.afterClosed().subscribe((retorno: ConciliacaoItem[] | boolean) => {
      if (!retorno) { return; }

      this.validacaoExclusaoCobranca(retorno as ConciliacaoItem[]);
    });
  }

  onExcluirArquivo(item: TableConciliacao) {
    let mensagem = `<span>As operações descritas nesse arquivo estão sendo cobradas pelo DETRAN, mas não foram localizadas na base do eContrato, impossibilitando que sejam reenviadas na tentativa de registro.</span>
                    <span>Dado esse cenário, o entendimento é de que foram enviadas ao DETRAN por outra registradora.</span>`;

    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: DialogAlertaConteudoComponent,
        conteudo: mensagem,
        pergunta: '<span class="bold">Confirma a exclusão desse arquivo?</span>',
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

    dialogRef.beforeClosed().subscribe((confirmacao: any) => {
      if (confirmacao) {
        this.store.dispatch(showPreloader({ payload: '' }));
        this.excluirArquivoConciliacao(item.id);
      }
    });
  }

  private excluirArquivoConciliacao(id: number) {
    this.faturamentoConciliadoService.excluirArquivoConciliacao(id).subscribe({
      next: (response) => {
        this.store.dispatch(closePreloader());
        
        if (response.deletado) {
          this.notifierService.showNotification('Arquivo de conciliação excluído com sucesso!', null, 'success');
          this.refresh$.next(null);
          this.atualizarGrids.emit(true);
        }
      },
      error: (response) => {
        this.store.dispatch(closePreloader());
        this.notifierService.showNotification(response.error.errors[0].message, null, 'error');
      }
    })
  }

  private validacaoExclusaoCobranca(itens: ConciliacaoItem[]) {
    let mensagem = `A Tecnobank não irá cobrar do cliente o registro desse contrato, no entanto, quando aplicável, a Tecnobank irá pagar a taxa do DETRAN em nome do cliente.<br>
     <br>
     <b>Essa ação é irreversível.</b>
     </p>`;

    const dialogRef = this.dialog.open(DialogExcluirDuplicidadeComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'info'),
      width: '500px',
      data: {
        duplicidade: false,
        mensagem: mensagem
      }
    });


    dialogRef.beforeClosed().subscribe((confirmacao: any) => {
      if (confirmacao) {
        let request = <ExcluirCobrancaRequest>{
          contabilizadoPrejuizo: confirmacao.acao === 2,
          motivoExclusao: confirmacao.motivo
        };

        this.excluirCobranca(itens, request);
      }
    });
  }

  private excluirCobranca(itens: ConciliacaoItem[], request: ExcluirCobrancaRequest) {
    this.faturamentoConciliadoService.excluirCobrancaConciliacao(itens[0].id, request).subscribe(response => {
      if (response?.deletado) {
        this.notifierService.showNotification('Contrato excluído da cobrança com sucesso!', null, 'success');
        this.refresh$.next(null);
        this.atualizarGrids.emit(true);
        return;
      }

      this.notifierService.showNotification(response.errors[0].message, null, 'error');
    });
  }

  sortData(sort: Sort) {
    this.sortConciliacao = `${sort.active}.${sort.direction}`
    this.carregaGridConciliacao();
  }

  private carregaGridConciliacao(filtros: FiltroConciliacao = null) {
    this.selection.clear();

    if (this.paginator) { this.paginator.pageIndex = 0; }

    setTimeout(() => {
      this.items$ = merge(this.refresh$, this.paginator?.page).pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults$.next(true);
          return this.listarConciliacoes(this.paginator?.pageIndex, this.paginator?.pageSize, this.sortConciliacao, filtros);
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
    }, 0)
    this.init = true;
  }

  private listarConciliacoes(pageIndex: number = 0, pageSize: number = 25, sort: string = null, filtros: FiltroConciliacao = null): Observable<ObterConciliacaoResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))
    return this.faturamentoConciliadoService.obterTableConciliacao(pageIndex, pageSize, sort, null, filtros);
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
