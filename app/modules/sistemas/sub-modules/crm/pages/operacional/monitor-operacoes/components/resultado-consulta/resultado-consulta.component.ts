import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';

import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import {
  closePreloader,
  showPreloader,
} from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { FiltrarTransacoesRequest } from '../../../../../../admin/core/requests/usuarios/transacoes/filtrar-transacoes.request';
import { TransacoesDetalhes } from '../../../../../core/models/transacoes/transacoes-detalhes.model';
import { Transacoes } from '../../../../../core/models/transacoes/transacoes.model';

import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import { Sort } from '@angular/material/sort';
import { Store } from '@ngrx/store';
import { BehaviorSubject, merge, Observable, of, Subject } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { TipoCanal } from 'src/app/modules/sistemas/core/enums/tipo-canal.enum';
import { SendImageComponent } from 'src/app/shared/components/send-image/send-image.component';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';
import { ImagemService } from 'src/app/shared/services/imagem.service';
import { MetadadoContrato } from '../../../../../../admin/core/models/_portal/common/metadado-contrato.model';
import { ValorDominio } from '../../../../../../admin/core/models/_portal/dominios/valor-dominio.model';
import { RegistrarImagemRequest } from '../../../../../../admin/core/requests/_portal/contratos/registrar-imagem.request';
import { ReprocessarListaTransacoesRequest } from '../../../../../../admin/core/requests/_portal/transacoes/reprocessar-lista-transacoes.request';
import { ContratoService } from '../../../../../../admin/services/_portal/contrato.service';
import { PortalDominioService } from '../../../../../../admin/services/_portal/portal-dominio.service';
import { TransacaoService } from '../../../../../../admin/services/_portal/transacao.service';
import { ReprocessarProtocolo } from '../../../../../core/models/transacoes/reprocessar-protocolo.model';
import { EditarManualmenteService } from '../../../../../services/editar-manualmente.service';
import { DialogConfirmarReprocessamentoComponent } from '../dialog-confirmar-reprocessamento/dialog-confirmar-reprocessamento.component';
import { DialogDsMensagemComponent } from '../dialog-ds-mensagem/dialog-ds-mensagem.component';
import { DialogEmitirCertidaoComponent } from '../dialog-emitir-certidao/dialog-emitir-certidao.component';
import { DialogReprocessarComponent } from '../dialog-reprocessar/dialog-reprocessar.component';
import { DadosInconsistencias } from '../../../../../core/models/Incosistencias/dados-inconsistencias.Model';

export interface Operacoes {
  Select: string;
  Login: string;
  DataRegistro: string;
  UF: string;
  Empresa: string;
  Chassi: number;
  Canal: string;
  Contrato: string;
  Status: string;
  Imagem: string;
}

@Component({
  selector: 'app-resultado-consulta',
  templateUrl: './resultado-consulta.component.html',
  styleUrls: ['./resultado-consulta.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class ResultadoConsultaComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  paramsConsulta: Map<string, string> = null;

  @Input('chaves') set setChavesPesquisa(value) {
    this.chavesPesquisa = value;
    return;
  }

  @Input('consulta') set setConsultaOperacoes(value) {
    this.paramsConsulta = value;
    this.selection = new SelectionModel<Transacoes>(
      this.allowMultiSelect,
      this.initialSelection
    );

    if (this.init) {
      this.carregarGrid();
    }
    return;
  }

  @Input('refresh') set refreshGrid(value) {
    if (this.init) this.refresh$.next(undefined);
  }

  @Output('espelhoProtocolo') espelhoProtocolo: EventEmitter<string> = new EventEmitter<string>();
  @Output('inconsistencias') inconsistencias: EventEmitter<Transacoes> = new EventEmitter<Transacoes>();
  @Output('closePreloader') closePreloader: EventEmitter<boolean> = new EventEmitter<boolean>();

  columnsToDisplay: string[] = [
    'Select',
    'Login',
    'DataRegistro',
    'UF',
    'Empresa',
    'Chassi',
    'Canal',
    'Operacao',
    'Contrato',
    'Status',
    'Imagem',
  ];

  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  transacoes: Transacoes[] = [];
  dataSource = new MatTableDataSource(this.transacoes);
  expandedElement: Operacoes | null;
  selectedImg: any;
  totalRegistros: number;
  items$: Observable<Transacoes[]>;
  loading: boolean = true;
  refresh$ = new Subject();
  readonly isLoadingResults$ = new BehaviorSubject(true);
  consulta: string[] = null;
  chavesPesquisa: any[];
  protocoloLote: string;
  transacaoDetalhes: TransacoesDetalhes = <TransacoesDetalhes>{
    agenteFinanceiro: null,
    tipoDocumento: null,
    documento: null,
    tipoRestricao: null,
    numeroContrato: null,
    gravame: null,
    renavam: null,
    placa: null,
    codigoRetorno: null,
    descricaoRetorno: null,
    tipoRestricaoDescricao: null,
    existeImagem: null,
  };
  protocolo: string;
  pipe = new DatePipe('en-US');

  initialSelection = [];
  allowMultiSelect = true;
  selection = new SelectionModel<Transacoes>(
    this.allowMultiSelect,
    this.initialSelection
  );
  sortListOperacoes: string = '';
  init: boolean = false;

  tiposRestricao: ValorDominio[] = [];
  habilitaReenvio: boolean = false;
  habilitaEditarManualmente: boolean = false;
  habilitaReprocessamento: boolean = false;
  mensagemInconsistencias: DadosInconsistencias[];

  certidao: any = null;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private transacaoService: TransacaoService,
    private notifierService: NotifierService,
    private store: Store<{ preloader: IPreloaderState }>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private dialogService: DialogCustomService,
    private contratoService: ContratoService,
    private imagemService: ImagemService,
    private authService: AuthService,
    private portalDominioService: PortalDominioService,
    private editarManualmenteService: EditarManualmenteService
  ) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) {
        let protocoloRota = this.activatedRoute.snapshot.params['protocoloLote'];

        if (!val['url']?.includes('espelho') && !val['url']?.includes('visualizar') && !val['url']?.includes('editar')) {
          this.scrollToExpanded();
        }

        if (this.protocoloLote !== protocoloRota) {
          this.protocoloLote = protocoloRota;
          if (this.protocoloLote && this.paramsConsulta) {
            this.paramsConsulta.set('ProtocoloLote', this.protocoloLote);
            if (this.init) {
              this.refresh$.next(undefined);
            }
          }
        }
      }
    });
  }

  ngOnInit(): void {
    this.dialogService.dialogData$.subscribe((data) => {
      if (data.dataType == 'img') {
        this.sendImage(data);
        return;
      }

      if (data.dataType == 'certidao') {
        this.certidao = data;
        return;
      }
    });

    this.carregarTipoRestricao();
  }

  ngAfterViewInit() {
    this.carregarGrid();
    this.init = true;
  }

  carregarGrid() {
    this.store.dispatch(showPreloader({ payload: '' }));
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }

    this.items$ = merge(this.refresh$, this.paginator?.page).pipe(
      shareReplay(),
      startWith({}),
      switchMap(() => {
        return this.filtrarTransacoes(
          this.paramsConsulta,
          this.paginator?.pageIndex,
          this.paginator?.pageSize
        );
      }),
      map((result: { transacoes: Transacoes[]; totalItems: number; habilitaReenvio: boolean; habilitaEdicao: boolean }) => {
        this.totalRegistros = result.totalItems;
        this.habilitaEditarManualmente = result.habilitaEdicao;
        this.habilitaReenvio = result.habilitaReenvio;

        if (!this.habilitaEditarManualmente && !this.habilitaReenvio) { this.selection.clear(); }

        this.dataSource = new MatTableDataSource<Transacoes>(result.transacoes);
        this.isLoadingResults$.next(false);
        this.closePreloader.emit(true);
        this.loading = false;
        return result.transacoes;
      }),
      catchError((err) => {
        console.info(err);
        this.isLoadingResults$.next(false);
        return of([]);
      })
    );
  }

  filtrarTransacoes(paramsConsulta, pageIndex: number = 0, pageSize: number = 25) {
    this.store.dispatch(showPreloader({ payload: '' }));
    const filtros: FiltrarTransacoesRequest = this.tratamentoParaFiltro(
      paramsConsulta,
      pageIndex,
      pageSize
    );
    return this.transacaoService.filtrarTransacoes(
      filtros,
      this.sortListOperacoes
    );
  }

  tratamentoParaFiltro(paramsConsulta, pageIndex, pageSize) {
    const novoFiltro: FiltrarTransacoesRequest = {
      Chassi: paramsConsulta.get('Chassi')
        ? paramsConsulta.get('Chassi')
        : null,
      Uf:
        paramsConsulta.get('Uf') && paramsConsulta.get('Uf').length > 0
          ? paramsConsulta.get('Uf')
          : null,
      TipoOperacao:
        paramsConsulta.get('TipoOperacao') &&
          paramsConsulta.get('TipoOperacao').length > 0
          ? paramsConsulta.get('TipoOperacao')
          : null,
      Codigo:
        paramsConsulta.get('codigoRetorno') && paramsConsulta.get('codigoRetorno').length > 0
          ? paramsConsulta.get('codigoRetorno')
          : null,
      StatusTransacao:
        paramsConsulta.get('StatusTransacao') &&
          paramsConsulta.get('StatusTransacao').length > 0
          ? paramsConsulta.get('StatusTransacao')
          : null,
      NomeStatusTransacao:
        paramsConsulta.get('NomeStatusTransacao') &&
          paramsConsulta.get('NomeStatusTransacao').length > 0
          ? paramsConsulta.get('NomeStatusTransacao')
          : null,
      ExisteImagem: paramsConsulta.get('ExisteImagem')
        ? paramsConsulta.get('ExisteImagem').length >= 2
          ? null
          : paramsConsulta.get('ExisteImagem')[0]
        : null,
      DataInicio: paramsConsulta.get('DataInicio'),
      DataFim: paramsConsulta.get('DataFim'),
      NumeroContrato: paramsConsulta.get('NumeroContrato'),
      NumeroAditivo: paramsConsulta.get('NumeroAditivo'),
      Renavam: null,
      NumeroGravame: paramsConsulta.get('NumeroGravame'),
      Placa: paramsConsulta.get('Placa'),
      DocumentoDevedor: paramsConsulta.get('DocumentoDevedor'),
      DocumentoCredor:
        paramsConsulta.get('DocumentoCredor') &&
          paramsConsulta.get('DocumentoCredor').length > 0
          ? paramsConsulta.get('DocumentoCredor')
          : null,
      CanalServico:
        paramsConsulta.get('CanalServico') &&
          paramsConsulta.get('CanalServico').length > 0
          ? paramsConsulta.get('CanalServico')
          : null,
      Email: paramsConsulta.get('Email'),
      PageIndex: pageIndex,
      PageSize: pageSize,
      Sort: this.sortListOperacoes,
      ProtocoloLote: paramsConsulta.get('ProtocoloLote') ?? null,
      Ativo: paramsConsulta.get('Ativo') == null ? null : (paramsConsulta.get('Ativo')?.length > 1 ? null : paramsConsulta.get('Ativo')[0])
    };

    return novoFiltro;
  }

  expandDetail(protocolo: string, expandedElement: boolean) {
    this.protocolo = protocolo;
    this.transacaoDetalhes = new TransacoesDetalhes();
    if (expandedElement) {
      this.transacaoService
        .obterDetalhesTransacao(protocolo)
        .subscribe((response) => {
          if (response.isSuccessful) {
            this.transacaoDetalhes = response.result.transacaoContrato;
            this.mensagemInconsistencias = JSON.parse(this.transacaoDetalhes.mensagensInconsistencias) ;
            if (this.transacaoDetalhes.documento) {
              this.transacaoDetalhes.documento =
                this.transacaoDetalhes.documento.replace(
                  /(\d{2})?(\d{3})?(\d{3})?(\d{4})?(\d{2})/,
                  '$1.$2.$3/$4-$5'
                );
            }
          } else {
            this.expandedElement = null;
            this.notifierService.showNotification(
              'Não foi possível carregar os detalhes do registro.',
              'Atenção',
              'error'
            );
          }
        });
    }
  }

  onClickImagem() {
    this.contratoService.obterImagem(this.protocolo).subscribe((response) => {
      this.imagemService.setImageData(response);
      if (!response.existeImagem) {
        this.imagemService.setImageData(null);
        this.dialogService.setDialogData('nodata');
      }
    });

    this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: SendImageComponent,
        title: 'Envio de imagem',
        buttonCancel: {
          value: false,
          text: 'Cancelar',
        },
        buttonConfirm: {
          value: true,
          text: 'Enviar',
        },
        showActionButtons: false,
      },
    });
  }

  emitirCertidao(protocolo: string, documento: string) {
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      id: protocolo,
      width: '500px',
      panelClass: 'dialog-emitir-certidao',
      data: {
        component: DialogEmitirCertidaoComponent,
        title: 'Emitir certidão',
        titleClass: 'desk text-gray-800',
        protocolo: this.protocolo,
        empresaDocumento: documento,
        buttonCancel: {
          value: false,
          text: 'Cancelar',
        },
        buttonConfirm: {
          value: true,
          text: 'Emitir',
        },
        disableSaveWithoutData: true
      },
    });

    dialogRef.afterClosed().subscribe(emitir => {
      if (emitir) {
        this.store.dispatch(showPreloader({ payload: '' }));
        if (this.certidao) {
          this.onEmitirCertidao(protocolo);
        }
      }
    });
  }

  private onEmitirCertidao(protocolo: string) {
    this.certidao.protocolo = protocolo;
    this.getEmitirCertidao(this.certidao);
  }

  getCookie(name) {
    var parts = document.cookie.split(name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
  }

  private getEmitirCertidao(data) {
    this.contratoService.getEmitirCertidao(data).subscribe(
      (res: any) => {
        this.store.dispatch(closePreloader());
        if (res.errors?.length) {
          this.notifierService.showNotification(res.errors[0].message, 'Erro', 'error');
          return;
        }

        if (data.tipoEnvio === 1) {
          var blob = this.b64toBlob(res.result.arquivo, 'application/pdf');
          let a = document.createElement('a');
          document.body.appendChild(a);
          var url = window.URL.createObjectURL(blob);

          a.href = url;
          a.download = String('certidao.pdf');
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();

          this.notifierService.showNotification(
            `Certidão emitida com sucesso.`,
            'Sucesso',
            'success'
          );
          return;
        }

        this.notifierService.showNotification(
          `Certidão emitida com sucesso e enviada por email.`,
          'Sucesso',
          'success'
        );
      },
      (error) => console.info(error)
    );
  }

  public b64toBlob(b64Data, contentType) {
    contentType = contentType || '';
    let sliceSize = 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  sendImage(img: any) {
    if (img == 'nodata') return;

    this.selectedImg = img;
    let requestImagem: RegistrarImagemRequest = <RegistrarImagemRequest>{
      nomeArquivo: this.selectedImg.data.nomeArquivo,
      imagemBase64: this.selectedImg.data.imagemBase64,
      metadadoContrato: <MetadadoContrato>{
        canalServico: 1,
      },
    };

    this.authService.obterUsuarioAtual().then((usuario) => {
      requestImagem.metadadoContrato.usuarioGuid = usuario.id;
      this.contratoService
        .enviarImagem(this.protocolo, requestImagem)
        .toPromise()
        .then((response) => {
          if (response.isSuccessful) {
            this.imagemService.setImageData({ success: true });
            this.notifierService.showNotification(
              response.status,
              null,
              'success'
            );
            this.refresh$.next(undefined);
            return;
          }

          this.imagemService.setImageData({
            success: false,
            erro: response.errors[0].message,
          });
        })
        .catch((response) => {
          this.imagemService.setImageData({
            success: false,
            erro: response.error.errors[0].message,
          });
        });
    });
  }

  openEspelho(protocolo: string) {
    this.espelhoProtocolo.emit(protocolo);
  }

  formatCriadoEm(criadoEm: string) {
    if (criadoEm == undefined) return;

    return this.pipe.transform(criadoEm, 'dd/MM/yyyy - HH:mm');
  }

  formatTipoOperacao(operacao: string) {
    if (operacao.includes('Alteracao')) {
      operacao = operacao.replace('Alteracao', 'Alteração');
    }

    return operacao;
  }

  verifyPageSelection() {
    let idsPagina = [];
    let idsSelecionados = [];

    if (this.selection.selected.length == 0) return 0;

    this.dataSource.data
      .filter(
        (data) =>
          data.habilitaCheckbox
      )
      .forEach((data) => {
        idsPagina.push(data.protocolo);

        let selecionado = this.selection.selected.filter(
          (s) => s.protocolo == data.protocolo
        )[0];
        if (selecionado) {
          idsSelecionados.push(selecionado.protocolo);
        }
      });

    if (idsPagina.length == idsSelecionados.length) {
      return 1;
    }
    if (idsSelecionados.length > 0) {
      return 2;
    }
    return 0;
  }

  toggleAllRows() {

    if (this.verifyPageSelection() == 1) {
      this.dataSource.data
        .filter(
          (data) =>
            data.habilitaCheckbox
        )
        .forEach((data) => {
          this.selection.deselect(
            this.selection.selected.filter(
              (s) => s.protocolo == data.protocolo
            )[0]
          );
        });
      this.habilitaReprocessamento = this.selection.selected.length == 1 && this.selection.selected[0].ehReprocessamento;
      return;
    }

    if (this.selection.selected.length > 0) {
      let selecionados = [];
      this.dataSource.data.forEach((data) => {
        if (
          this.selection.selected.filter((s) => s.protocolo == data.protocolo)
            .length > 0
        ) {
          selecionados.push(data.protocolo);
        }
      });
      this.selection.select(
        ...this.dataSource.data
          .filter(
            (data) =>
              data.habilitaCheckbox
          )
          .filter(
            (data) =>
              selecionados.filter((s) => s == data.protocolo).length == 0
          )
      );
      this.habilitaReprocessamento = this.selection.selected.length == 1 && this.selection.selected[0].ehReprocessamento;
      return;
    }

    this.selection.select(
      ...this.dataSource.data
        .filter(
          (data) =>
            data.habilitaCheckbox
        )
    );
    this.habilitaReprocessamento = this.selection.selected.length == 1 && this.selection.selected[0].ehReprocessamento;
  }

  check(row: Transacoes) {
    if (this.selection.selected.length > 0) {
      if (this.selection.selected.filter((s) => s.protocolo == row.protocolo).length > 0) {
        this.selection.deselect(this.selection.selected.filter((s) => s.protocolo == row.protocolo)[0]);


        this.habilitaReprocessamento = this.selection.selected.length == 1 && this.selection.selected[0].ehReprocessamento;
        return;
      }
    }

    this.selection.select(row);
    this.habilitaReprocessamento = this.selection.selected.length == 1 && row.ehReprocessamento;
  }

  isSelected(row) {
    if (this.selection.selected.length > 0) {
      return (
        this.selection.selected.filter((r) => r.protocolo == row.protocolo)
          .length > 0
      );
    }

    return this.selection.isSelected(row);
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }

  sortData(sort: Sort) {
    switch (sort.active) {
      case 'Login':
        this.sortListOperacoes = `email.${sort.direction}`;
        break;

      case 'DataRegistro':
        this.sortListOperacoes = `criadoEm.${sort.direction}`;
        break;

      case 'UF':
        this.sortListOperacoes = `uf.${sort.direction}`;
        break;

      case 'Empresa':
        this.sortListOperacoes = `nomeEmpresa.${sort.direction}`;
        break;

      case 'Chassi':
        this.sortListOperacoes = `chassi.${sort.direction}`;
        break;

      case 'Canal':
        this.sortListOperacoes = `canalServico.${sort.direction}`;
        break;

      case 'Operacao':
        this.sortListOperacoes = `tipoOperacao.${sort.direction}`;
        break;

      case 'Contrato':
        this.sortListOperacoes = `numeroContrato.${sort.direction}`;
        break;

      case 'Status':
        this.sortListOperacoes = `statusTransacao.${sort.direction}`;
        break;

      case 'Imagem':
        this.sortListOperacoes = `existeImagem.${sort.direction}`;
        break;
    }

    this.filtrarTransacoes(
      this.paramsConsulta,
      this.paginator.pageIndex,
      this.paginator.pageSize
    );
    this.refresh$.next(undefined);
  }

  onReenviar(reenvioComplemento: boolean = false) {
    if (!Utility.getPermission([Permissoes.GESTAO_OPERACOES_CONTRATO_REENVIAR])) return;

    let reenvioTransacao: ReprocessarListaTransacoesRequest = <
      ReprocessarListaTransacoesRequest
      >{ protocolosTransacao: [] };
    let mensagem = '1 operação foi reenviada.';
    this.store.dispatch(showPreloader({ payload: '' }));
    this.selection.selected.forEach((value) => {
      reenvioTransacao.protocolosTransacao.push(<ReprocessarProtocolo>{
        protocolo: value.protocolo,
      });
    });
    reenvioTransacao.reenvioComplemento = reenvioComplemento;
    if (reenvioTransacao.protocolosTransacao.length > 1)
      mensagem = `${reenvioTransacao.protocolosTransacao.length} operações foram reenviadas.`;

    this.transacaoService
      .reprocessarListaTransacoes(reenvioTransacao)
      .subscribe((response) => {
        this.store.dispatch(closePreloader());
        if (response.isSuccessful) {
          this.notifierService.showNotification(mensagem, null, 'success');
          this.refresh$.next(undefined);
          this.selection.clear();
          return;
        }

        this.notifierService.showNotification(
          response.errors[0].message,
          null,
          'error'
        );
      });
  }

  onEditarManualmente() {
    if (!Utility.getPermission([Permissoes.GESTAO_OPERACOES_CONTRATO_REGISTRAR])) return;

    let protocolos = [];
    this.selection.selected.forEach((value) => { protocolos.push(value.protocolo); });
    this.editarManualmenteService.retornoProtocolos(protocolos);

    if (this.protocoloLote) {
      this.router.navigateByUrl(`/monitor-operacoes-lotes/${this.protocoloLote}/editar-manualmente`);
      return;
    }

    this.router.navigateByUrl(`/monitor-operacoes-lotes/editar-manualmente`);
  }

  reprocessar() {
    if (!Utility.getPermission([Permissoes.GESTAO_OPERACOES_CONTRATO_REGISTRAR])) return;

    let protocolo: string = this.selection.selected[0].protocolo;

    const dialogRef = this.dialog.open(DialogCustomComponent, {
      id: Utility.getElementId(TipoElemento.pnl, 'reprocessar'),
      width: '500px',
      data: {
        component: DialogReprocessarComponent,
        title: 'Reprocessar operação',
        titleClass: 'desk text-gray-800',
        buttonCancel: {
          value: false,
          text: 'Cancelar',
        },
        buttonConfirm: {
          value: true,
          text: 'Reprocessar',
        },
        disableSaveWithoutData: true
      },
    });

    dialogRef.afterClosed().subscribe(reprocessar => {
      if (reprocessar) {
        this.confirmarReprocessamento(protocolo);
      }
    });
  }

  visualizarInconsistencias(transacao: Transacoes) {
    this.inconsistencias.emit(transacao);
  }

  getCanalLabel(canalService: TipoCanal) {
    switch (canalService) {
      case TipoCanal.Portal:
        return 'Tela';
      case TipoCanal.SIS:
        return 'SIS';
      case TipoCanal.SRD:
        return 'SRD';
      case TipoCanal.Lote:
        return 'Lote';
      default:
        return '';
    }
  }

  openDsMensagem(protocolo: string) {
    this.transacaoService.obterDsMensagem(protocolo).subscribe((response) => {
      if (response.transacaoProtocoloDsMensagem) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '500px';
        dialogConfig.height = '350px';

        dialogConfig.data = {
          transacaoProtocoloDsMensagem: response.transacaoProtocoloDsMensagem,
        };
        this.dialog.open(DialogDsMensagemComponent, dialogConfig);
      }
    });
  }

  getTipoRestricao(tipoRestricao: number): string {
    return this.tiposRestricao.filter((tp) => tp.id == tipoRestricao)[0]?.valor;
  }

  public getElementId(
    tipoElemento: number,
    nomeElemento: string,
    guidElemento: any = null
  ): string {
    return Utility.getElementId(tipoElemento, nomeElemento, guidElemento);
  }

  private carregarTipoRestricao() {
    this.portalDominioService
      .obterPorTipo('TIPO_RESTRICAO')
      .subscribe((response) => {
        this.tiposRestricao = response.valorDominio;
      });
  }

  private scrollToExpanded(): void {
    let element = document.getElementsByClassName('expanded-row')[0] as HTMLElement;
    if (element) {
      Utility.waitFor(() => {
        element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }, 500);
    }
  }

  private confirmarReprocessamento(protocolo: string) {
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      id: Utility.getElementId(TipoElemento.pnl, 'confirmar-reprocessamento'),
      width: '500px',
      data: {
        component: DialogConfirmarReprocessamentoComponent,
        title: 'Atenção',
        titleClass: 'desk text-gray-800',
        buttonCancel: {
          value: false,
          text: 'Cancelar',
        },
        buttonConfirm: {
          value: true,
          text: 'Sim, reprocessar',
        },
        disableSaveWithoutData: true
      },
    });

    dialogRef.afterClosed().subscribe(reprocessar => {
      if (reprocessar) {
        this.reprocessarTransacao(protocolo);
      }
    });
  }

  private reprocessarTransacao(protocolo: string) {
    if (!Utility.getPermission([Permissoes.GESTAO_OPERACOES_CONTRATO_REENVIAR])) return;

    let reenvioTransacao: ReprocessarListaTransacoesRequest = <ReprocessarListaTransacoesRequest>{
      protocolosTransacao: <ReprocessarProtocolo[]>[{
        protocolo: protocolo
      }],
      reprocessarDetran: false
    };

    this.store.dispatch(showPreloader({ payload: '' }));

    this.transacaoService
      .reprocessarListaTransacoes(reenvioTransacao)
      .subscribe((response) => {
        this.store.dispatch(closePreloader());

        if (response.isSuccessful) {
          this.notifierService.showNotification('Operação reprocessada com sucesso.', null, 'success');
          this.refresh$.next(undefined);
          this.selection.clear();
          return;
        }

        this.notifierService.showNotification(
          response.errors[0].message,
          null,
          'error'
        );
      });
  }

  habilitaBotaoReenvio700(): boolean {
    const ufValidas = ["PE", "PB"];
    const statusValidos = [1, 2, 4, 5, 6, 7, 8, 10];
    return this.selection.selected.every(registro => ufValidas.includes(registro.uf) && statusValidos.includes(registro.idStatusTransacao));
  }
}