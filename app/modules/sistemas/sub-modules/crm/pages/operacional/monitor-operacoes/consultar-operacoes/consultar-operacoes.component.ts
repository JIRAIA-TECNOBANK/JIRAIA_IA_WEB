import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatLegacySelectChange as MatSelectChange } from '@angular/material/legacy-select';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Subject } from 'rxjs';

import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { TipoDocumento } from 'src/app/core/enums/tipo-documento.enum';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { TipoCanal } from 'src/app/modules/sistemas/core/enums/tipo-canal.enum';
import { FORMATO_DATA } from 'src/app/modules/sistemas/core/models/common/formato-date-picker.model';
import { Documento } from 'src/app/modules/sistemas/core/models/documento.model';
import { FiltrarTransacoesRequest } from 'src/app/modules/sistemas/sub-modules/admin/core/requests/usuarios/transacoes/filtrar-transacoes.request';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FilterCustomField } from 'src/app/shared/core/models/grid-filter/filter-custom-field.model';
import { FilterFieldReturn } from 'src/app/shared/core/models/grid-filter/filter-field-return.model';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';
import {
  closePreloader,
  showPreloader,
} from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { Dominios } from '../../../../../admin/core/models/dominios/dominios.model';
import { PortalDominioService } from '../../../../../admin/services/_portal/portal-dominio.service';
import { TransacaoService } from '../../../../../admin/services/_portal/transacao.service';
import { Empresas } from '../../../../core/models/empresas/empresas.model';
import { Transacoes } from '../../../../core/models/transacoes/transacoes.model';
import { DominiosResponse } from '../../../../core/responses/dominios/dominios.response';
import { DominioService } from '../../../../services/dominio.service';
import { EmpresasService } from '../../../../services/empresas.service';
import { EnviaArquivoLoteComponent } from '../components/envia-arquivo-lote/envia-arquivo-lote.component';

@Component({
  selector: 'app-consultar-operacoes',
  templateUrl: './consultar-operacoes.component.html',
  styleUrls: ['./consultar-operacoes.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: FORMATO_DATA },
  ],
})
export class ConsultarOperacoesComponent implements OnInit {
  utility = Utility;
  Permissoes = Permissoes;

  childstate: boolean = false;
  tabNumber: number = 0;
  pipe = new DatePipe('en-US');

  //#region table Operacoes

  dataInicialPadrao: Date;
  dataFinalPadrao: Date;

  private protocoloLote: string = null;
  protocoloLote$: Subject<string> = new BehaviorSubject('');

  chavesPesquisa: Dominios[];
  chavePesquisa: string = null;
  periodos: any[];
  formularioConsulta: FormGroup;
  labelChave: string = 'Escolha o tipo de pesquisa';
  masks: string;
  attributes = { type: 'text', maxlength: '' };

  minDate: Date;
  maxDate: Date;
  erroDataFinal: boolean = false;
  consultaOperacoes: Map<string, any> = new Map<string, any>();

  filter: GridFilter;
  filterOptionUF: FieldOption[] = [];
  filterOptionStatus: FieldOption[] = [];
  filterOptionPeriodo: FieldOption[] = [];
  filterOptionEmpresa: FieldOption[] = [];
  filterOptionCodigoRetorno: FieldOption[] = [];
  listEmpresaOptionsSelected: FieldOption[] = [];

  requiredFieldsError: boolean = false;
  fieldChassi: FilterField = <FilterField>{
    id: 'Chassi',
    titulo: 'Por chassi',
    tipo: TipoFilterField.Text,
    validators: Validators.compose([
      Validators.minLength(3),
      Validators.maxLength(21),
    ])
  };

  fieldEmpresa: FilterField = <FilterField>{
    id: 'DocumentoCredor',
    titulo: 'Por empresa',
    tipo: TipoFilterField.Checkbox,
    options: this.filterOptionEmpresa,
    searchInput: true,
    showTooltip: true,
  };

  fieldOperacao: FilterField = <FilterField>{
    id: 'TipoOperacao',
    titulo: 'Por operação',
    tipo: TipoFilterField.Checkbox,
    selectAllOptions: 'Todas',
    options: [
      <FieldOption>{ value: 1, label: 'Registro de contrato' },
      <FieldOption>{ value: 2, label: 'Alterar contrato' },
      <FieldOption>{ value: 3, label: 'Registrar aditvo' },
      <FieldOption>{ value: 4, label: 'Alterar aditivo' },
    ]
  };

  fieldCodigoRetorno: FilterField = <FilterField>{
    id: 'codigoRetorno',
    titulo: 'Por código de retorno',
    tipo: TipoFilterField.Checkbox,
    options: this.filterOptionCodigoRetorno,
    searchInput: true,
    showTooltip: true,
  };

  fieldStatus: FilterField = <FilterField>{
    id: 'NomeStatusTransacao',
    titulo: 'Por status',
    tipo: TipoFilterField.Checkbox,
    selectAllOptions: 'Todos',
    options: this.filterOptionStatus,
    showTooltip: true,
    iconClass: "fa-regular fa-circle-info",
    iconTooltip: "Esse status representa a visão de origem da Tecnobank."
  };

  fieldImagem: FilterField = <FilterField>{
    id: 'ExisteImagem',
    titulo: 'Por imagem',
    tipo: TipoFilterField.Checkbox,
    selectAllOptions: 'Todas',
    options: [
      <FieldOption>{ value: true, label: 'Processadas' },
      <FieldOption>{ value: false, label: 'Não processadas' },
    ]
  };

  fieldPeriodo: FilterField = <FilterField>{
    id: 'Periodo',
    titulo: 'Por período',
    tipo: TipoFilterField.Custom,
    options: this.filterOptionPeriodo,
    customFields: [
      <FilterCustomField>{ id: 'DataInicio' },
      <FilterCustomField>{ id: 'DataFim' },
    ]
  };

  fieldCanal: FilterField = <FilterField>{
    id: 'CanalServico',
    titulo: 'Canal',
    tipo: TipoFilterField.Checkbox,
    selectAllOptions: 'Todos',
    options: [
      <FieldOption>{ value: TipoCanal.Portal, label: 'Tela' },
      <FieldOption>{ value: TipoCanal.SIS, label: 'SIS' },
      <FieldOption>{ value: TipoCanal.SRD, label: 'SRD' },
      <FieldOption>{ value: TipoCanal.Lote, label: 'Lote' },
    ],
  };

  fieldUf: FilterField = <FilterField>{
    id: 'Uf',
    titulo: 'Por UF',
    tipo: TipoFilterField.Checkbox,
    options: this.filterOptionUF,
    selectAllOptions: 'Todas',
  };

  fieldOpcoes: FilterField = <FilterField>{
    id: 'opOutras',
    titulo: 'Outras opções',
    tipo: TipoFilterField.Custom,
    customFields: [
      <FilterCustomField>{ id: 'NumeroContrato' },
      <FilterCustomField>{ id: 'NumeroAditivo' },
      <FilterCustomField>{ id: 'NumeroGravame' },
      <FilterCustomField>{ id: 'Placa' },
      <FilterCustomField>{ id: 'DocumentoDevedor' },
      <FilterCustomField>{ id: 'Email' },
    ],
  };

  fieldStatusPortal: FilterField = <FilterField>{
    id: 'StatusTransacao',
    titulo: 'Por status',
    tipo: TipoFilterField.Checkbox,
    options: [],
    showTooltip: true,
    iconClass: "fa-regular fa-circle-info",
    iconTooltip: "Esse status representa a visão que o cliente possui através do portal."
  };

  fieldAtivo: FilterField = <FilterField>{
    id: 'Ativo',
    titulo: 'Por contratos ativos',
    tipo: TipoFilterField.Checkbox,
    options: [
      <FieldOption>{ label: 'Ativos', value: true },
      <FieldOption>{ label: 'Inativos', value: false }
    ],
    selectAllOptions: 'Todos',
    showTooltip: true
  };

  chassiControl: FormControl;
  empresaControl: FormControl;
  empresaSearchControl: FormControl;
  operacaoControl: FormControl;
  codigoRetornoControl: FormControl;
  codigoRetornoSearchControl: FormControl;
  statusControl: FormControl;
  imagemControl: FormControl;
  periodoControl: FormControl;
  dataInicialControl: FormControl;
  dataFinalControl: FormControl;
  canalControl: FormControl;
  ufControl: FormControl;
  opcoesControl: FormControl;
  statusPortalControl: FormControl;
  ativoControl: FormControl;

  redefinirField: boolean = false;
  showRedefinirButton: boolean = true;
  refreshConsulta = false;
  operacoesGridLoad: boolean = false;

  filtroPreDefinido: FiltrarTransacoesRequest = null;

  //#endregion

  //#region table Lotes

  monitorLotes: Map<string, string> = new Map<string, string>();
  minDateLote: Date;
  minInitialLoteDate: Date;
  maxDateLote: Date;

  refreshGrid: boolean = false;
  redefinirLoteField: boolean = false;
  showRedefinirLoteButton: boolean = true;
  customFormControls: Map<string, AbstractControl>;

  filterLote: GridFilter;
  fieldLoteEmpresa: FilterField = <FilterField>{
    id: 'empresaId',
    tipo: TipoFilterField.Checkbox,
    options: this.filterOptionEmpresa,
    searchInput: true,
    titulo: 'Por empresa',
    showTooltip: true,
  };

  fieldLoteVersao: FilterField = <FilterField>{
    id: 'dominioId',
    tipo: TipoFilterField.Checkbox,
    options: [],
    searchInput: false,
    titulo: 'Por versão',
    selectAllOptions: 'Todas',
  };

  fieldLoteStatus: FilterField = <FilterField>{
    id: 'statusTransacao',
    tipo: TipoFilterField.Checkbox,
    options: [],
    searchInput: false,
    titulo: 'Por status',
    selectAllOptions: 'Todos',
  };

  fieldLoteProtocolo: FilterField = <FilterField>{
    id: 'protocoloLote',
    tipo: TipoFilterField.Text,
    titulo: 'Por protocolo do lote',
  };

  fieldLotePeriodo: FilterField = <FilterField>{
    id: 'periodo',
    titulo: 'Por período',
    tipo: TipoFilterField.Custom,
    options: [],
    customFields: [
      <FilterCustomField>{ id: 'loteDataInicio' },
      <FilterCustomField>{ id: 'loteDataFim' },
    ],
  };

  loteEmpresaSearchControl: FormControl;
  loteEmpresaControl: FormControl;
  loteVersaoControl: FormControl;
  loteStatusControl: FormControl;
  loteProtocoloControl: FormControl;
  lotePeriodoControl: FormControl;
  loteDataInicioControl: FormControl;
  loteDataFimControl: FormControl;

  refreshLote = false;
  lotesGridLoad: boolean = false;

  //#endregion

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  constructor(
    private fb: UntypedFormBuilder,
    private dominioService: DominioService,
    private portalDominioService: PortalDominioService,
    private transacaoService: TransacaoService,
    private router: Router,
    private empresaService: EmpresasService,
    private dialog: MatDialog,
    private dialogService: DialogCustomService,
    private store: Store<{ preloader: IPreloaderState }>,
    private notifierService: NotifierService,
    private activatedRoute: ActivatedRoute
  ) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd)
        this.childstate =
          val['url']?.includes('espelho') || val['url']?.includes('visualizar') || val['url']?.includes('editar');

      let protocoloRota = this.activatedRoute.snapshot.params['protocoloLote'];
      if (protocoloRota !== undefined && protocoloRota !== null && protocoloRota !== '') {
        this.protocoloLote$.next(protocoloRota);
      }
    });

    if (this.activatedRoute.snapshot.queryParams?.tab) { this.tabNumber = this.activatedRoute.snapshot.queryParams?.tab === 'lotes' ? 1 : 0; }
    if (!this.activatedRoute.snapshot.queryParams?.filtroPreDefinido) this.filtroPreDefinido = null;

    this.maxDate = new Date();
    this.minInitialLoteDate = new Date();
  }

  ngOnInit(): void {
    this.transacaoService.filtroOperacoes$.subscribe(filtro => {
      this.filtroPreDefinido = filtro;
    });

    this.inicializarForm();
    this.carregarChavePesquisa();
    if (!this.filtroPreDefinido) this.carregarEmpresasFiltro();
    this.carregarEmpresasFiltro('', false);
    this.carregarPeriodo();
    this.carregarUfsLicenciamento();
    this.carregarStatusRegistro();
    this.carregarStatusTransacaoPortal();
    this.carregarStatusLote();
    this.carregarVersoesLote();
    this.obterCodigoRetorno();

    this.protocoloLote$.subscribe((value) => {
      if (value) {
        this.protocoloLote = value;
        this.onChangeProtocoloLote();
      }
    });

    this.carregarFiltroOperacoes();
    this.carregarFiltroLotes();
  }

  changeTab(tab: any) {
    this.tabNumber = tab.index;
  }

  search(paramsConsulta) {
    this.carregarDatas(paramsConsulta.get(this.fieldPeriodo.id), paramsConsulta);
    this.carregarOpcoesValue(
      paramsConsulta.get(this.fieldOpcoes.id),
      paramsConsulta
    );

    this.consultaOperacoes = paramsConsulta;
    if (this.protocoloLote) {
      this.consultaOperacoes.set('ProtocoloLote', this.protocoloLote);
    }
    this.showRedefinirButton = true;
  }

  searchLotes(paramsConsulta) {
    this.carregarDatas(
      paramsConsulta.get(this.fieldLotePeriodo.id),
      paramsConsulta,
      false
    );
    this.monitorLotes = paramsConsulta;
    this.showRedefinirLoteButton = true;
  }

  setCustomControls(event: Map<string, AbstractControl>) {
    this.chassiControl = event.get(this.fieldChassi.id) as FormControl;
    this.empresaControl = event.get(this.fieldEmpresa.id) as FormControl;
    this.empresaSearchControl = event.get(
      this.fieldEmpresa.id + '_search'
    ) as FormControl;
    this.operacaoControl = event.get(this.fieldOperacao.id) as FormControl;
    this.codigoRetornoControl = event.get(
      this.fieldCodigoRetorno.id
    ) as FormControl;
    this.codigoRetornoSearchControl = event.get(
      this.fieldCodigoRetorno.id + '_search'
    ) as FormControl;
    this.statusControl = event.get(this.fieldStatus.id) as FormControl;
    this.imagemControl = event.get(this.fieldImagem.id) as FormControl;
    this.periodoControl = event.get(this.fieldPeriodo.id) as FormControl;
    this.dataInicialControl = event.get(
      this.fieldPeriodo.customFields[0].id
    ) as FormControl;
    this.dataFinalControl = event.get(
      this.fieldPeriodo.customFields[1].id
    ) as FormControl;
    this.canalControl = event.get(this.fieldCanal.id) as FormControl;
    this.ufControl = event.get(this.fieldUf.id) as FormControl;
    this.opcoesControl = event.get(this.fieldOpcoes.id) as FormControl;
    this.statusPortalControl = event.get(this.fieldStatusPortal.id) as FormControl;
    this.ativoControl = event.get(this.fieldAtivo.id) as FormControl;

    if (!this.protocoloLote) {
      if (this.activatedRoute.snapshot.queryParams?.filtroPreDefinido && this.filtroPreDefinido) {
        this.carregarFiltrosPreDefinidos();
        return;
      }

      this.carregarPeriodoPadrao();
    }
  }

  setLoteCustomControls(event: Map<string, AbstractControl>) {
    this.loteEmpresaControl = event.get(
      this.fieldLoteEmpresa.id
    ) as FormControl;
    this.loteEmpresaSearchControl = event.get(
      this.fieldLoteEmpresa.id + '_search'
    ) as FormControl;
    this.loteVersaoControl = event.get(this.fieldLoteVersao.id) as FormControl;
    this.loteStatusControl = event.get(this.fieldLoteStatus.id) as FormControl;
    this.loteProtocoloControl = event.get(
      this.fieldLoteProtocolo.id
    ) as FormControl;
    this.lotePeriodoControl = event.get(
      this.fieldLotePeriodo.id
    ) as FormControl;
    this.loteDataInicioControl = event.get(
      this.fieldLotePeriodo.customFields[0].id
    ) as FormControl;
    this.loteDataFimControl = event.get(
      this.fieldLotePeriodo.customFields[1].id
    ) as FormControl;

    this.customFormControls = new Map([
      ['De', event.get('De')],
      ['Ate', event.get('De')],
    ]);
  }

  selecionarChave(event: MatSelectChange) {
    if (event.value !== undefined) {
      this.labelChave = event.source.triggerValue;
      this.formularioConsulta.controls['inputChave'].enable();
      this.chavePesquisa = this.obterChavePesquisa(event.value);
      this.labelChave = this.chavesPesquisa.filter(
        (cp) => cp.palavraChave == this.chavePesquisa
      )[0].valor;

      switch (this.chavePesquisa) {
        case 'CP_NUMERO_CONTRATO':
          this.formularioConsulta
            .get('inputChave')
            .setValidators(
              Validators.compose([
                Validators.minLength(3),
                Validators.maxLength(21),
                Validators.required,
              ])
            );
          this.formularioConsulta.get('inputChave').updateValueAndValidity();
          this.masks = '';
          this.attributes = {
            type: 'text',
            maxlength: '21',
          };
          break;
        case 'CP_NUMERO_ADITIVO':
          this.formularioConsulta
            .get('inputChave')
            .setValidators(
              Validators.compose([
                Validators.minLength(3),
                Validators.maxLength(21),
                Validators.required,
              ])
            );
          this.formularioConsulta.get('inputChave').updateValueAndValidity();
          this.masks = '';
          this.attributes = {
            type: 'text',
            maxlength: '21',
          };
          break;
        case 'CP_NUMERO_GRAVAME':
          this.formularioConsulta
            .get('inputChave')
            .setValidators(
              Validators.compose([
                Validators.minLength(5),
                Validators.maxLength(8),
                Validators.required,
              ])
            );
          this.masks = '';
          this.attributes = {
            type: 'text',
            maxlength: '8',
          };
          break;
        case 'CP_PLACA':
          this.formularioConsulta
            .get('inputChave')
            .setValidators(
              Validators.compose([
                Validators.minLength(5),
                Validators.maxLength(8),
                Validators.required,
              ])
            );
          this.masks = '';
          this.attributes = {
            type: 'text',
            maxlength: '7',
          };
          break;
        case 'CP_CNPJ_DEVEDOR':
          this.formularioConsulta
            .get('inputChave')
            .setValidators([Validators.required]);
          this.masks = this.carregarMascaraDocumento('cnpj');
          this.attributes = {
            type: 'text',
            maxlength: '',
          };
          break;
        case 'CP_CPF_DEVEDOR':
          this.formularioConsulta
            .get('inputChave')
            .setValidators([Validators.required]);
          this.masks = this.carregarMascaraDocumento('cpf');
          this.attributes = {
            type: 'text',
            maxlength: '',
          };
          break;
        case 'CP_LOGIN':
          this.formularioConsulta
            .get('inputChave')
            .setValidators([Validators.required]);
          this.masks = '';
          this.attributes = {
            type: 'text',
            maxlength: '',
          };
          break;

        default:
          this.labelChave = 'Escolha o tipo de pesquisa';
          break;
      }
    } else {
      this.formularioConsulta.get('inputChave').disable();
      this.labelChave = 'Escolha o tipo de pesquisa';
    }

    this.formularioConsulta.get('inputChave').setValue(null);
    for (let name in this.formularioConsulta.controls) {
      this.formularioConsulta.controls[name].setErrors(null);
    }

    this.formularioConsulta.get('inputChave').updateValueAndValidity();
    this.formularioConsulta.markAllAsTouched();
  }

  cleanDates() {
    this.dataInicialControl?.reset();
    this.dataFinalControl?.reset();
  }

  cleanDatesLote() {
    this.loteDataInicioControl.reset();
    this.loteDataFimControl.reset();
  }

  onChangePeriodoLote(value: any, inicial: boolean) {
    this.lotePeriodoControl.reset();

    if (inicial) {
      this.carregarDataMinima(value);
      return;
    }

    this.verificarData(value, false);
  }

  redefinirConsultaOperacoes() {
    this.formularioConsulta.reset();
    this.inicializarOperacoes();
    this.requiredFieldsError = false;
    this.labelChave = 'Escolha o tipo de pesquisa';
    this.redefinirField = !this.redefinirField;

    if (!this.protocoloLote) {
      this.carregarPeriodoPadrao();
    }
  }

  redefinirMonitorLotesGrid() {
    this.inicializarLotes();
    this.refreshGrid = !this.refreshGrid;
    this.redefinirLoteField = !this.redefinirLoteField;
  }

  selectAll(fieldReturn: FilterFieldReturn) {
    switch (fieldReturn.field.id) {
      case this.fieldUf.id:
        this.selectAllOptions(
          this.ufControl,
          fieldReturn.selected,
          this.fieldUf.options
        );
        break;

      case this.fieldOperacao.id:
        this.selectAllOptions(
          this.operacaoControl,
          fieldReturn.selected,
          this.fieldOperacao.options
        );
        break;

      case this.fieldStatus.id:
        this.selectAllOptions(
          this.statusControl,
          fieldReturn.selected,
          this.fieldStatus.options
        );
        break;

      case this.fieldLoteStatus.id:
        this.selectAllOptions(
          this.loteStatusControl,
          fieldReturn.selected,
          this.fieldLoteStatus.options
        );
        break;

      case this.fieldImagem.id:
        this.selectAllOptions(
          this.imagemControl,
          fieldReturn.selected,
          this.fieldImagem.options
        );
        break;

      case this.fieldStatusPortal.id:
        this.selectAllOptions(
          this.statusPortalControl,
          fieldReturn.selected,
          this.fieldStatusPortal.options
        );
        break;

      case this.fieldAtivo.id:
        this.selectAllOptions(
          this.ativoControl,
          fieldReturn.selected,
          this.fieldAtivo.options
        );
        break;

      case this.fieldCanal.id:
        this.selectAllOptions(
          this.canalControl,
          fieldReturn.selected,
          this.fieldCanal.options
        );
        break;

      case this.fieldLoteVersao.id:
        this.selectAllOptions(
          this.loteVersaoControl,
          fieldReturn.selected,
          this.fieldLoteVersao.options
        );
        break;
    }
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  redefinir(control: FormControl, field: FilterField) {
    control.reset();

    if (field.id == this.fieldPeriodo.id) {
      this.dataInicialControl.reset();
      this.dataFinalControl.reset();
      return;
    }

    if (field.id == this.fieldLotePeriodo.id) {
      this.loteDataInicioControl.reset();
      this.loteDataFimControl.reset();
      return;
    }

    if (field.id == this.fieldOpcoes.id) {
      this.formularioConsulta.reset();
      this.inicializarOperacoes();
      this.labelChave = 'Escolha o tipo de pesquisa';
      return;
    }

    if (field.id == this.fieldEmpresa.id) {
      if (this.fieldEmpresa.searchInput) {
        this.empresaSearchControl.reset();
        this.onChangeSearch(null, true);
      }

      return;
    }
  }

  searchFilter(event: FieldOption) {
    if (event.label == 'DocumentoCredor') {
      let filtro = Utility.checkNumbersOnly(event.value);
      this.carregarEmpresasFiltro(filtro);
    }

    if (event.label == 'empresaId') {
      let filtro = Utility.checkNumbersOnly(event.value);
      this.carregarEmpresasFiltro(filtro, false);
    }

    if (event.label == 'codigoRetorno') {
      let filtro = Utility.checkNumbersOnly(event.value);
      filtro = filtro === '0' ? (filtro = '') : filtro;
      this.obterCodigoRetorno(filtro);
    }
  }

  openEspelho(protocolo: string) {
    if (this.protocoloLote) {
      this.router.navigate(
        [`monitor-operacoes-lotes/${this.protocoloLote}/espelho-contrato`],
        {
          queryParams: { protocolo: protocolo },
        }
      );
      return;
    }

    this.router.navigate(['monitor-operacoes-lotes/espelho-contrato'], {
      queryParams: { protocolo: protocolo },
    });
  }

  visualizarInconsistencias(transacao: Transacoes) {
    let tipoOperacao: string;

    if (transacao.tipoOperacao == 'Registro de Contrato') {
      tipoOperacao = 'registrar-contrato';
    } else if (transacao.tipoOperacao == 'Registro de Aditivo') {
      tipoOperacao = 'registrar-aditivo';
    } else if (transacao.tipoOperacao == 'Alteracao de Contrato') {
      tipoOperacao = 'alterar-contrato';
    } else {
      tipoOperacao = 'alterar-aditivo';
    }

    this.childstate = true;
    if (this.protocoloLote) {
      this.router.navigateByUrl(
        `/monitor-operacoes-lotes/${this.protocoloLote}/visualizar-inconsistencias?protocolo=${transacao.protocolo}&uf=${transacao.uf}&operacao=${tipoOperacao}`
      );
      return;
    }

    this.router.navigateByUrl(
      `/monitor-operacoes-lotes/visualizar-inconsistencias?protocolo=${transacao.protocolo}&uf=${transacao.uf}&operacao=${tipoOperacao}`
    );
  }

  onClickEnviarLote() {
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'enviar-arquivos'),
      width: '500px',
      data: {
        component: EnviaArquivoLoteComponent,
        title: 'Enviar contratos',
        buttonCancel: {
          value: false,
          text: 'Fechar',
        },
        buttonConfirm: {
          value: true,
          text: 'Enviar',
        },
        disableSaveWithoutData: true,
      },
    });

    dialogRef.beforeClosed().subscribe((confirmacao) => {
      let fileBase64 = '';
      let versaoLote = null;
      let operacao = null;
      let nomeArquivo = '';
      let empresaId = null;
      let nomeEmpresa = '';

      this.dialogService.dialogData$.subscribe((data) => {
        fileBase64 = data.file;
        versaoLote = data.versaoLote;
        operacao = data.operacao;
        nomeArquivo = data.nomeArquivo;
        empresaId = data.empresaId;
        nomeEmpresa = data.nomeEmpresa;
      });

      if (fileBase64 == 'nodata') return;

      if (confirmacao) {
        this.store.dispatch(showPreloader({ payload: '' }));
        let usuarioGuid = sessionStorage.getItem('userGuid');

        this.transacaoService
          .enviarLote(
            fileBase64,
            versaoLote,
            operacao,
            nomeArquivo,
            empresaId,
            nomeEmpresa,
            usuarioGuid
          )
          .toPromise()
          .then((response) => {
            if (response.isSuccessful) {
              this.notifierService.showNotification(
                response.status,
                'Envio de lote',
                'success'
              );
              this.refreshGrid = !this.refreshGrid;
              this.store.dispatch(closePreloader());
              return;
            }

            this.notifierService.showNotification(
              response.errors[0].message,
              'Erro ' + response.errors[0].code,
              'error'
            );
            this.store.dispatch(closePreloader());
          })
          .catch((response) => {
            this.notifierService.showNotification(
              response.error.errors[0].message,
              'Erro ' + response.error.errors[0].code,
              'error'
            );
            this.store.dispatch(closePreloader());
          });
      }
    });
  }

  atualizarPagina() {
    this.refreshConsulta = !this.refreshConsulta;
    this.refreshLote = !this.refreshLote;
  }

  onClosePreloader(consultaRegistros: boolean) {
    this.store.dispatch(closePreloader());

    if (consultaRegistros) { this.operacoesGridLoad = true; }
    else { this.lotesGridLoad = true; }
  }

  addDays = (input, days) => {
    if (input) {
      const date = input._d ? new Date(input._d) : new Date(input);
      date.setDate(date.getDate() + days);
      date.setDate(Math.min(date.getDate(), this.getDaysInMonth(date.getFullYear(), date.getMonth() + 1)));

      return date;
    }
  };

  getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();

  //#region METODOS PRIVADOS
  private inicializarForm(): void {
    this.inicializarOperacoes();
    this.inicializarLotes();
  }

  private inicializarOperacoes() {
    this.formularioConsulta = this.fb.group({ inputChave: [''] });
    this.formularioConsulta.controls['inputChave'].disable();

    this.consultaOperacoes = new Map<string, any>();
    this.consultaOperacoes.set('TipoOperacao', null);
    this.consultaOperacoes.set('StatusTransacao', null);
    this.consultaOperacoes.set('Chassi', null);
    this.consultaOperacoes.set('Placa', null);
    this.consultaOperacoes.set('NumeroContrato', null);
    this.consultaOperacoes.set('NumeroAditivo', null);
    this.consultaOperacoes.set('Renavam', null);
    this.consultaOperacoes.set('NumeroGravame', null);
    this.consultaOperacoes.set('Uf', null);
    this.consultaOperacoes.set('DocumentoCredor', null);
    this.consultaOperacoes.set('DocumentoDevedor', null);
    this.consultaOperacoes.set('DataInicio', null);
    this.consultaOperacoes.set('DataFim', null);
    this.consultaOperacoes.set('ExisteImagem', null);
    this.consultaOperacoes.set('Sort', null);
    this.consultaOperacoes.set('CanalServico', null);
    this.consultaOperacoes.set('Email', null);
    this.consultaOperacoes.set('ProtocoloLote', this.protocoloLote);
    this.consultaOperacoes.set('Ativo', null);
    this.showRedefinirButton = false;
  }

  private inicializarLotes() {
    this.monitorLotes.set('empresaId', null);
    this.monitorLotes.set('dominioId', null);
    this.monitorLotes.set('statusTransacao', null);
    this.monitorLotes.set('protocoloLote', null);
    this.monitorLotes.set('periodo', null);
    this.monitorLotes.set('loteDataInicio', null);
    this.monitorLotes.set('loteDataFim', null);
    this.showRedefinirLoteButton = false;

    this.minInitialLoteDate.setDate(this.minInitialLoteDate.getDate() - 180);
  }

  private carregarFiltroOperacoes() {
    this.filter = <GridFilter>{
      id: 'monitor-op',
      customFields: true,
      fields: [
        this.fieldChassi,
        this.fieldEmpresa,
        this.fieldOperacao,
        this.fieldCodigoRetorno,
        this.fieldStatus,
        this.fieldImagem,
        this.fieldPeriodo,
        this.fieldCanal,
        this.fieldUf,
        this.fieldOpcoes,
        this.fieldStatusPortal,
        this.fieldAtivo
      ]
    };
  }

  private carregarFiltroLotes() {
    this.filterLote = <GridFilter>{
      id: 'lotes',
      customFields: true,
      fields: <FilterField[]>[
        this.fieldLoteEmpresa,
        this.fieldLoteVersao,
        this.fieldLoteStatus,
        this.fieldLoteProtocolo,
        this.fieldLotePeriodo,
      ]
    };
  }

  private carregarVersoesLote() {
    this.fieldLoteVersao.options = [];
    this.portalDominioService
      .obterPorTipo('VERSOES_LOTE')
      .subscribe((response) => {
        response.valorDominio.forEach((dominio) => {
          this.fieldLoteVersao.options.push(<FieldOption>{
            value: dominio.id,
            label: dominio.valor,
          });
        });
      });
  }

  private obterCodigoRetorno(filter = '') {
    this.filterOptionCodigoRetorno.length = 0;
    this.transacaoService.getCodigoRetorno(filter).subscribe(
      (response) => {
        if (response.isSuccessful) {
          response.result.listaCodigoDePara.forEach((codigo) => {
            this.filterOptionCodigoRetorno.push({
              value: codigo.codigo,
              label: codigo.descricao,
            });
          });
        }
        if (response.errors) {
          response.errors.forEach((error) => {
            console.info(`${error.code}-${error.message}`);
          });
        }
      },
      (error) => console.info(error)
    );
  }

  private onChangeProtocoloLote() {
    if (this.protocoloLote) this.tabNumber = 0;
    this.consultaOperacoes.set('ProtocoloLote', this.protocoloLote)
    this.cleanDates();
  }

  private carregarPeriodoPadrao() {
    let hoje = new Date();
    let ontem = new Date();
    ontem.setDate(new Date().getDate() - 1);

    this.dataInicialPadrao = ontem;
    this.dataFinalPadrao = hoje;

    this.fieldPeriodo.defaultValue = { 'De': ontem };

    this.dataInicialControl?.patchValue(ontem);
    this.dataFinalControl?.patchValue(hoje);

    this.consultaOperacoes.set('DataInicio', this.pipe.transform(ontem, 'MM-dd-yyyy'));
    this.consultaOperacoes.set('DataFim', this.pipe.transform(hoje, 'MM-dd-yyyy'));

    this.showRedefinirButton = false;
  }

  private async carregarFiltrosPreDefinidos() {
    this.consultaOperacoes = new Map<string, any>();
    //SETA OS VALORES NO CONTROL DE CADA FILTRO
    this.dataInicialControl?.patchValue(new Date(this.filtroPreDefinido.DataInicio));
    this.dataFinalControl?.patchValue(new Date(this.filtroPreDefinido.DataFim));
    this.statusPortalControl?.patchValue(this.filtroPreDefinido.StatusTransacao);
    this.ativoControl?.patchValue(this.filtroPreDefinido.Ativo);

    if (this.filtroPreDefinido.ExisteImagem != null) { this.imagemControl?.patchValue([!!this.filtroPreDefinido?.ExisteImagem]); }
    if (this.filtroPreDefinido.Uf != null) { this.ufControl?.patchValue(this.filtroPreDefinido?.Uf); }
    if (this.filtroPreDefinido.DocumentoCredor != null) { this.selecionarEmpresa(); }
    if (this.filtroPreDefinido.Ativo != null) { this.ativoControl?.patchValue([!!this.filtroPreDefinido?.Ativo]); }
    if (this.filtroPreDefinido.Chassi != null) { this.chassiControl?.patchValue(this.filtroPreDefinido?.Chassi); }
    if (this.filtroPreDefinido.TipoOperacao != null) { this.operacaoControl?.patchValue(this.filtroPreDefinido?.TipoOperacao); }

    //SETA OS VALORES NO FILTRO DA GRID
    this.consultaOperacoes.set('DataInicio', this.pipe.transform(this.filtroPreDefinido.DataInicio, 'MM-dd-yyyy'));
    this.consultaOperacoes.set('DataFim', this.pipe.transform(this.filtroPreDefinido.DataFim, 'MM-dd-yyyy'));
    this.consultaOperacoes.set('ExisteImagem', this.imagemControl.value);
    this.consultaOperacoes.set('StatusTransacao', this.filtroPreDefinido.StatusTransacao);
    this.consultaOperacoes.set('Uf', this.filtroPreDefinido.Uf);
    this.consultaOperacoes.set('DocumentoCredor', this.filtroPreDefinido.DocumentoCredor);
    this.consultaOperacoes.set('Ativo', [true]);
    this.consultaOperacoes.set('Chassi', this.filtroPreDefinido.Chassi);
    this.consultaOperacoes.set('TipoOperacao', this.filtroPreDefinido.TipoOperacao);

    this.search(this.consultaOperacoes);
  }

  private async selecionarEmpresa() {
    //PESQUISA A EMPRRESA
    this.empresaSearchControl?.patchValue(this.filtroPreDefinido?.DocumentoCredor[0]);

    if (await this.carregarEmpresasFiltroInput(this.filtroPreDefinido?.DocumentoCredor[0], true)) {
      //SELECIONA A EMPRESA DO FILTRO
      let aux = this.fieldEmpresa.options[0];
      this.fieldEmpresa.defaultValue = aux;
      this.empresaControl?.patchValue(this.filtroPreDefinido?.DocumentoCredor);
    }
  }

  private carregarMascaraDocumento(tipoDocumento: string): string {
    if (tipoDocumento == TipoDocumento.Cpf) return Documento.mascaraCPF();
    return Documento.mascaraCNPJ();
  }

  private carregarChavePesquisa() {
    this.dominioService
      .obterPorTipo('CHAVE_PESQUISA')
      .subscribe((response: DominiosResponse) => {
        if (response.isSuccessful) this.chavesPesquisa = response.valorDominio;
        let chassi = this.chavesPesquisa.filter(
          (cp) => cp.palavraChave == 'CP_CHASSI'
        )[0];
        let cliente = this.chavesPesquisa.filter(
          (cp) => cp.palavraChave == 'CP_CLIENTE'
        )[0];
        if (chassi) {
          let index = this.chavesPesquisa.indexOf(chassi);
          this.chavesPesquisa.splice(index, 1);
        }
        if (cliente) {
          let index = this.chavesPesquisa.indexOf(cliente);
          this.chavesPesquisa.splice(index, 1);
        }

        let login = this.chavesPesquisa.filter(
          (cp) => cp.palavraChave == 'CP_LOGIN'
        )[0];
        if (!login) {
          this.chavesPesquisa.push(<Dominios>{
            id: 100,
            palavraChave: 'CP_LOGIN',
            valor: 'Login',
          });
        }

        response.errors.forEach((error) => {
          console.info(`${error.code}-${error.message}`);
        });
      });
  }

  private carregarPeriodo() {
    this.fieldPeriodo.options = [];
    this.fieldLotePeriodo.options = [];
    this.portalDominioService.obterPorTipo('PERIODO').subscribe(
      (response: DominiosResponse) => {
        if (response.isSuccessful) {
          this.periodos = response.valorDominio;
          this.periodos.forEach((periodo) => {
            this.fieldPeriodo.options.push(<FieldOption>{
              value: periodo.id,
              label: periodo.valor,
            });
            this.fieldLotePeriodo.options.push(<FieldOption>{
              value: periodo.id,
              label: periodo.valor,
            });
          });
        }

        response.errors.forEach((error) => {
          console.info(`${error.code}-${error.message}`);
        });
      },
      (error) => console.info(error)
    );
  }

  private carregarUfsLicenciamento() {
    this.dominioService.obterPorTipo('UF_DETRAN').subscribe((result) => {
      result.valorDominio.forEach((uf) => {
        this.filterOptionUF.push(<FieldOption>{
          value: uf.valor,
          label: uf.valor,
        });
      });
    });
  }

  private carregarStatusRegistro() {
    this.transacaoService.obterStatusTransacao().subscribe(
      (response) => {
        if (response.isSuccessful) {
          response.statusTransacao.forEach((status) => {
            this.filterOptionStatus.push(<FieldOption>{
              value: status.id,
              label: `${status.id} - ${status.nome}`,
            });
          });
        }

        response.errors.forEach((error) => {
          console.info(`${error.code}-${error.message}`);
        });
      },
      (error) => console.info(error)
    );
  }

  private carregarStatusTransacaoPortal() {
    this.transacaoService.obterStatusTransacoes().subscribe(
      (response) => {
        let options = [];
        if (response.isSuccessful) {
          response.statusTransacao.forEach((status) => {
            options.push(<FieldOption>{
              value: status.id,
              label: status.nome,
            });
          });
        }

        this.fieldStatusPortal.options = options;

        response.errors.forEach((error) => {
          console.info(`${error.code}-${error.message}`);
        });
      },
      (error) => console.info(error)
    );
  }

  private carregarStatusLote() {
    this.fieldLoteStatus.options = [];
    this.transacaoService.obterStatusLote().subscribe(
      (response) => {
        if (response.isSuccessful) {
          response.listaStatusLote.forEach((status) => {
            this.fieldLoteStatus.options.push(<FieldOption>{
              value: status.satusLoteId,
              label: status.nome,
            });
          });
        }

        response.errors.forEach((error) => {
          console.info(`${error.code}-${error.message}`);
        });
      },
      (error) => console.info(error)
    );
  }

  private obterClienteNomeCnpj(cliente: Empresas) {
    let cnpj = <Documento>{ numero: cliente.cnpj, tipoDocumento: 2 };
    return `${cliente.nomeFantasia} (${Utility.formatDocument(cnpj)})`;
  }
  private carregarEmpresasFiltro(filtroEmpresa: string = '', operacoes: boolean = true) {
    if (filtroEmpresa) {
      this.carregarEmpresasFiltroInput(filtroEmpresa, operacoes);
      return;
    }

    this.carregarEmpresasFiltroPadrao(operacoes);
  }

  private async carregarEmpresasFiltroInput(filtroEmpresa: string = '', operacoes: boolean = true) {
    let empresas = await this.empresaService
      .obterEmpresasFiltro(0, 10, filtroEmpresa).toPromise();

    this.carregarEmpresasFiltradas(empresas.empresas, operacoes);
    if (empresas.empresas.length > 0) {
      return true;
    }
    // .subscribe((response) => {
    //   if (response.isSuccessful) {
    //     this.carregarEmpresasFiltradas(response.empresas, operacoes);
    //   }
    // });
  }

  private carregarEmpresasFiltroPadrao(operacoes: boolean = true) {
    this.empresaService.obterEmpresas(0, 10).subscribe((response) => {
      if (response.isSuccessful) {
        this.carregarEmpresasFiltradas(response.empresas, operacoes);
      }
    });
  }

  private carregarEmpresasFiltradas(empresas: Empresas[], operacoes: boolean = true) {
    let options = [];
    empresas.forEach((empresa) => {
      options.push(<FieldOption>{
        value: operacoes ? empresa.cnpj : empresa.id,
        label: this.obterClienteNomeCnpj(empresa),
      });
    });

    if (operacoes) {
      this.filter.fields.filter((field) => field.id == 'DocumentoCredor')[0].options = options;
    }
    else {
      this.filterLote.fields.filter((field) => field.id == 'empresaId')[0].options = options;
    }

  }

  private obterChavePesquisa(value) {
    return this.chavesPesquisa.filter((chave) => chave.id == value)[0]
      ?.palavraChave;
  }

  private verificarData(dataFinal: any, operacoes: boolean = true) {
    let data1;
    let data2;
    data1 = Utility.formatDate(
      operacoes
        ? this.dataInicialControl.value
        : this.loteDataInicioControl.value
    );
    data2 = Utility.formatDate(dataFinal);

    if (data1 !== '' && data2 !== '') {
      const data1Split = data1.split('-');
      const data2Split = data2.split('-');
      const novaData1 = new Date(
        data1Split[2],
        data1Split[1] - 1,
        data1Split[0]
      );
      const novaData2 = new Date(
        data2Split[2],
        data2Split[1] - 1,
        data2Split[0]
      );

      if (novaData1.getTime() <= novaData2.getTime()) {
        this.erroDataFinal = false;
      } else {
        this.erroDataFinal = true;
        if (operacoes) {
          this.dataFinalControl.setValue('');
        } else {
          this.loteDataFimControl.setValue('');
        }
      }
    }
  }

  private onChangeSearch(value: string, reset?: boolean) {
    if (reset || value == '') {
      this.searchFilter(<FieldOption>{
        label: this.fieldEmpresa.id,
        value: '',
      });
      if (reset) {
        this.listEmpresaOptionsSelected = [];
        return;
      }

      this.updateOptions();
      return;
    }

    if (value.length >= 3) {
      this.searchFilter(<FieldOption>{
        label: this.fieldEmpresa.id,
        value: value,
      });
      this.updateOptions();
    }
  }

  private updateOptions() {
    Utility.waitFor(() => {
      this.listEmpresaOptionsSelected.forEach((selected) => {
        let option = this.fieldEmpresa.options.filter(
          (op) => op.value == selected.value
        )[0];
        if (option) {
          this.fieldEmpresa.options.splice(
            this.fieldEmpresa.options.indexOf(option),
            1
          );
        }
      });
    }, 1000);
  }

  private selectAllOptions(
    control: FormControl,
    selected: boolean,
    options: FieldOption[]
  ) {
    if (selected) {
      control.patchValue([...options.map((item) => item.value), 'selectAll']);
      return;
    }

    control.patchValue([]);
  }

  private carregarDatas(
    value: any[],
    paramsConsulta: Map<string, string>,
    operacoes: boolean = true
  ) {
    let dataInicialId = operacoes
      ? this.fieldPeriodo.customFields[0].id
      : this.fieldLotePeriodo.customFields[0].id;
    let dataFinalId = operacoes
      ? this.fieldPeriodo.customFields[1].id
      : this.fieldLotePeriodo.customFields[1].id;

    let defaulValue = value?.filter((v) => v.id == 'default')[0]?.value;

    if (defaulValue) {
      let periodo = this.periodos.filter((p) => p.id == defaulValue)[0]
        ?.palavraChave;

      if (periodo) {
        const date = new Date();
        paramsConsulta.set(dataFinalId, this.transformarDataParaPadraoApi(date));

        switch (periodo) {
          case 'P_ULTIMO_30_DIAS':
            paramsConsulta.set(dataInicialId, this.subtrairDias(date, 30));
            break;
          case 'P_ULTIMO_60_DIAS':
            paramsConsulta.set(dataInicialId, this.subtrairDias(date, 60));
            break;
          case 'P_ULTIMO_90_DIAS':
            paramsConsulta.set(dataInicialId, this.subtrairDias(date, 90));
            break;
        }
      }

      return;
    }

    let dataInicialValue = value?.filter((v) => v.id == dataInicialId)[0]?.value;

    if (dataInicialValue) {
      let dataInicial = Utility.formatDate(dataInicialValue);

      const dataISplit = dataInicial.split('-');
      paramsConsulta.set(
        dataInicialId,
        `${dataISplit[1]}-${dataISplit[0]}-${dataISplit[2]}`
      );

      let dataFinal = Utility.formatDate(
        value.filter((v) => v.id == dataFinalId)[0]?.value
      );

      const dataFSplit = dataFinal.split('-');
      paramsConsulta.set(
        dataFinalId,
        `${dataFSplit[1]}-${dataFSplit[0]}-${dataFSplit[2]}`
      );
    }
  }

  private transformarDataParaPadraoApi(date: Date): string {
    const data = new Date(Number(date));
    let novaData;
    let dataPadraoApi;
    novaData = data.toISOString().split('T')[0].split('-');
    dataPadraoApi = `${novaData[1]}-${novaData[2]}-${novaData[0]}`;
    return dataPadraoApi;
  }

  private subtrairDias(date: Date, days: number): string {
    const data = new Date(Number(date));
    let novaData;
    let dataPadraoApi;
    data.setDate(date.getDate() - days);
    novaData = data.toISOString().split('T')[0].split('-');
    dataPadraoApi = `${novaData[1]}-${novaData[2]}-${novaData[0]}`;
    return dataPadraoApi;
  }

  private carregarOpcoesValue(value: any[], paramsConsulta: Map<string, string>) {
    let defaulValue = value?.filter((v) => v.id == 'default')[0]?.value;

    if (defaulValue) {
      let indexField = null;

      switch (
      this.chavesPesquisa.filter((cp) => cp.id == defaulValue)[0].palavraChave
      ) {
        case 'CP_NUMERO_CONTRATO':
          indexField = 0;
          break;
        case 'CP_NUMERO_ADITIVO':
          indexField = 1;
          break;
        case 'CP_NUMERO_GRAVAME':
          indexField = 2;
          break;
        case 'CP_PLACA':
          indexField = 3;
          break;
        case 'CP_CNPJ_DEVEDOR':
          indexField = 4;
          break;
        case 'CP_CPF_DEVEDOR':
          indexField = 4;
          break;
        case 'CP_LOGIN':
          indexField = 5;
          break;
      }

      paramsConsulta.set(
        this.fieldOpcoes.customFields[indexField].id,
        this.formularioConsulta.get('inputChave').value
      );
    }
  }

  private carregarDataMinima(dataFinal: any) {
    let data1;
    data1 = Utility.formatDate(dataFinal);
    const data1Split = data1.split('-');

    this.minDateLote = new Date(
      data1Split[2],
      data1Split[1] - 1,
      data1Split[0]
    );
    this.minInitialLoteDate.setDate(this.minDateLote.getDate() - 180);
  }
  //#endregion
}
