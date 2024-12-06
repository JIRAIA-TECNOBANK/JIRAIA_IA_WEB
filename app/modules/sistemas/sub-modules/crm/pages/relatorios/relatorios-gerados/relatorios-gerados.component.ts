import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { Documento } from 'src/app/modules/sistemas/core/models/documento.model';
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
import { PortalDominioService } from '../../../../admin/services/_portal/portal-dominio.service';
import { PortalRelatoriosService } from '../../../../admin/services/_portal/relatorio.service';
import { EmpresaFiltro } from '../../../core/models/empresas/empresa-filtro.model';
import { Empresas } from '../../../core/models/empresas/empresas.model';
import { GruposEconomicosFiltro } from '../../../core/models/grupos-economicos/grupos-economicos-filtro.model';
import { RelatoriosFiltro } from '../../../core/models/relatorios/relatorios-filtro.model';
import { DominiosResponse } from '../../../core/responses/dominios/dominios.response';
import { EmpresasService } from '../../../services/empresas.service';
import { DialogInformacoesComponent } from '../components/dialog-informacoes/dialog-informacoes.component';
import { DialogSolicitarRelatorioComponent } from '../components/dialog-solicitar-relatorio/dialog-solicitar-relatorio.component';
import { SolicitarRelatorioRequest } from '../core/requests/solicitar-relatorio.request';

@Component({
  selector: 'app-relatorios-gerados',
  templateUrl: './relatorios-gerados.component.html',
  styleUrls: ['./relatorios-gerados.component.scss'],
})
export class RelatoriosGeradosComponent implements OnInit {

  utility = Utility;

  constructor(
    private dialog: MatDialog,
    private dialogService: DialogCustomService,
    private relatoriosService: PortalRelatoriosService,
    private empresaService: EmpresasService,
    private notifierService: NotifierService,
    private portalDominioService: PortalDominioService,
    private store: Store<{ preloader: IPreloaderState }>,
    private router: Router
  ) { }

  childstate: boolean = false;
  refreshGrid: boolean = false;
  init: boolean = false;
  filterOptionPeriodo: FieldOption[] = [];
  filterOptionEmpresa: FieldOption[] = [];
  nomeRelatorios: FieldOption[] = [];
  solicitacao;
  existemRelatorios: boolean = false;
  requiredFieldsError: boolean = false;
  sortListaRelatorios: string = '';

  showRedefinirGruposBtn: boolean = false;

  filtroEmpresas: EmpresaFiltro;
  filtroGrupos: GruposEconomicosFiltro;

  fieldNomeEmpresa: FilterField = <FilterField>{
    id: 'empresaNome',
    titulo: 'Por empresa',
    tipo: TipoFilterField.Checkbox,
    options: this.filterOptionEmpresa,
    searchInput: true,
    showTooltip: true
  };

  fieldNome: FilterField = <FilterField>{
    id: 'tipoRelatorio',
    titulo: 'Por modelo',
    tipo: TipoFilterField.Checkbox,
    selectAllOptions: 'Todos',
    options: this.nomeRelatorios,
  };

  fieldPeriodoEmpresa: FilterField = <FilterField>{
    id: 'empresaPeriodo',
    titulo: 'Por período',
    tipo: TipoFilterField.Period,
    options: this.filterOptionPeriodo,
    customFields: [
      <FilterCustomField>{ id: 'De' },
      <FilterCustomField>{ id: 'Ate' },
    ],
  };

  fieldStatusEmpresas: FilterField = <FilterField>{
    id: 'status',
    titulo: 'Por status',
    tipo: TipoFilterField.Checkbox,
    selectAllOptions: 'Todos',
    options: [
      <FieldOption>{ value: 3, label: 'Processado' },
      <FieldOption>{ value: 2, label: 'Em processamento' },
      <FieldOption>{ value: 4, label: 'Erro' },
    ],
  };

  filterEmpresas: GridFilter = <GridFilter>{
    id: 'relatorios',
    customFields: true,
    fields: [
      this.fieldNomeEmpresa,
      this.fieldNome,
      this.fieldPeriodoEmpresa,
      this.fieldStatusEmpresas,
    ],
  };

  codigoEmpresaControl: FormControl;
  empresaNomeControl: FormControl;
  empresaNomeSearchControl: FormControl;
  nomeControl: FormControl;
  periodoEmpresaControl: FormControl;
  dataInicialEmpresaControl: FormControl;
  dataFinalEmpresaControl: FormControl;
  statusEmpresaControl: FormControl;

  codigoGrupoControl: FormControl;
  grupoNomeControl: FormControl;
  grupoNomeSearchControl: FormControl;
  periodoGrupoControl: FormControl;
  dataInicialGrupoControl: FormControl;
  dataFinalGrupoControl: FormControl;
  statusGrupoControl: FormControl;

  refreshGruposGrid: boolean = false;
  refreshEmpresasGrid: boolean = false;

  minInitialEmpresaDate: Date;
  minInitialGrupoDate: Date;

  minDate: Date;
  maxDate: Date;
  minDateGrupo: Date;
  maxDateGrupo: Date;
  erroDataFinal: boolean = false;
  erroDataFinalEmpresa: boolean = false;

  relatorioSolicitacao: SolicitarRelatorioRequest = null;

  ngOnInit(): void {
    this.carregarPeriodo();
    this.carregarTiposRelatorio();

    this.dialogService.dialogData$.subscribe((val) => {
      if (val == 'nodata') { return; }

      this.relatorioSolicitacao = val;
    })
  }

  openDialogInformacoes() {
    this.dialog.open(DialogCustomComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'info'),
      width: '397px',
      data: {
        component: DialogInformacoesComponent,
        title: '',
        buttonCancel: {
          value: false,
          text: 'Entendi',
        },
        buttonConfirm: {
          value: true,
          text: 'Enviar',
        },
        disableSaveWithoutData: true,
      },
    });
  }

  private carregarPeriodo() {
    this.portalDominioService.obterPorTipo('PERIODO').subscribe(
      (response: DominiosResponse) => {
        if (response.isSuccessful) {
          response.valorDominio.forEach((periodo) => {
            this.filterOptionPeriodo.push(<FieldOption>{
              value: periodo.palavraChave,
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

  openDialogSolicitarRelatorio() {
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'solicitar-relatorio'),
      width: '550px',
      height: '',
      data: {
        component: DialogSolicitarRelatorioComponent,
        title: 'Solicitar relatório',
        buttonCancel: {
          value: false,
          text: 'Fechar',
        },
        buttonConfirm: {
          value: true,
          text: 'Solicitar',
        },
        disableSaveWithoutData: true,
      },
      autoFocus: false
    });

    dialogRef.beforeClosed().subscribe((confirmacao) => {
      if (confirmacao) {
        this.checkRelatorioProcessando();
        this.submitRelatorio();
        this.refreshGrid = !this.refreshGrid;
      }
    });
  }

  submitRelatorio() {
    this.store.dispatch(showPreloader({ payload: '' }));
    this.relatoriosService
      .solicitarRelatorio(this.relatorioSolicitacao)
      .toPromise()
      .then((result) => {
        if (result.errors) {
          this.notifierService.showNotification(
            result.errors[0].message,
            result.errors[0].code,
            'error'
          );
          this.store.dispatch(closePreloader());
          return;
        }
        this.refreshGrid = !this.refreshGrid;
        this.checkRelatorioProcessando();
        this.store.dispatch(closePreloader());
        this.notifierService.showNotification(
          'Solicitação do relatório realizada com sucesso, por favor, aguarde o processamento.',
          'Sucesso',
          'success'
        );
        this.store.dispatch(closePreloader());
      })
      .catch((result) => {
        this.notifierService.showNotification(
          result.message,
          result.status,
          'error'
        );
        this.store.dispatch(closePreloader());
      });
  }

  checkRelatorioProcessando() {
    this.relatoriosService
      .validarRelatoriosProcessando()
      .subscribe((result) => {
        this.existemRelatorios = result.existemRelatorios;
      });
  }

  searchEmpresas(event) {
    let primeiroArray = event.get();
    let segundoArray = event.get(this.fieldNomeEmpresa.id);
    let empresaId = this.createIdArray(primeiroArray, segundoArray);
    let tipoRelatorio = event.get(this.fieldNome.id);
    let dataInicio = event.get('De');
    let dataFim = event.get('Ate');
    let status = event.get(this.fieldStatusEmpresas.id);

    this.filtroEmpresas = <RelatoriosFiltro>{
      empresaId: empresaId != null ? empresaId : '',
      dominio: tipoRelatorio != null ? (tipoRelatorio.length == this.nomeRelatorios.length ? '' : tipoRelatorio) : '',
      dataInicio: dataInicio != null ? dataInicio : '',
      dataFim: dataFim != null ? dataFim : '',
      status: status != null ? status : ''
    };

    this.showRedefinirGruposBtn = false;
  }

  createIdArray(companyIdArray1, companyIdArray2) {
    let newArray = [];
    companyIdArray1 && newArray.push(companyIdArray1);
    companyIdArray2 &&
      companyIdArray2.forEach((company) => {
        newArray.push(company);
      });
    return newArray.length ? newArray : '';
  }

  setCustomControls(event: Map<string, AbstractControl>) {
    this.empresaNomeControl = event.get(
      this.fieldNomeEmpresa.id
    ) as FormControl;
    this.empresaNomeSearchControl = event.get(
      this.fieldNomeEmpresa.id + '_search'
    ) as FormControl;
    this.nomeControl = event.get(
      this.fieldNome.id
    ) as FormControl;
    this.periodoEmpresaControl = event.get(
      this.fieldPeriodoEmpresa.id
    ) as FormControl;
    this.dataInicialEmpresaControl = event.get(
      this.fieldPeriodoEmpresa.customFields[0].id
    ) as FormControl;
    this.dataFinalEmpresaControl = event.get(
      this.fieldPeriodoEmpresa.customFields[1].id
    ) as FormControl;
    this.statusEmpresaControl = event.get(
      this.fieldStatusEmpresas.id
    ) as FormControl;
  }


  redefinirEmpresas() {
    this.filtroEmpresas = null;
    this.refreshEmpresasGrid = !this.refreshEmpresasGrid;
    this.showRedefinirGruposBtn = false;
    this.minInitialEmpresaDate.setDate(new Date().getDate() - 180);
  }


  searchFilterEmpresas(event: FieldOption) {
    let filtro = Utility.checkNumbersOnly(event.value);
    filtro = filtro === '0' ? filtro = '' : filtro;
    this.carregarEmpresas(filtro);
  }

  carregarEmpresas(filtroEmpresa = '') {
    this.filterOptionEmpresa = [];
    filtroEmpresa
      ? this.carregarEmpresasComFiltro(filtroEmpresa)
      : this.carregarEmpresasSemFiltro();
  }

  private carregarEmpresasComFiltro(filtroEmpresa) {
    this.empresaService.obterEmpresasFiltro(0, 10, filtroEmpresa).subscribe(
      (response) => {
        if (response.isSuccessful) {
          let options = [];
          response.empresas.forEach((empresa) => {
            options.push(<FieldOption>{
              value: empresa.id,
              label: this.getClienteNomeCnpj(empresa),
            });
          });

          this.fieldNomeEmpresa.options = options;
        }

        response.errors.forEach((error) => {
          console.info(`${error.code}-${error.message}`);
        });
      },
      (error) => console.info(error)
    );
  }

  private carregarEmpresasSemFiltro() {
    this.empresaService.obterEmpresas(0, 10).subscribe(
      (response) => {
        if (response.isSuccessful) {
          let options = [];
          response.empresas.forEach((empresa) => {
            options.push(<FieldOption>{
              value: empresa.id,
              label: this.getClienteNomeCnpj(empresa),
            });
          });

          this.fieldNomeEmpresa.options = options;
        }

        response.errors.forEach((error) => {
          console.info(`${error.code}-${error.message}`);
        });
      },
      (error) => console.info(error)
    );
  }

  getClienteNomeCnpj(cliente: Empresas) {
    let cnpj = <Documento>{ numero: cliente.cnpj, tipoDocumento: 2 };
    return `${cliente.nomeFantasia} (${Utility.formatDocument(cnpj)})`;
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  redefinir(control: FormControl, field: FilterField) {
    control.reset();

    if (field.id == this.fieldPeriodoEmpresa.id) {
      this.dataInicialEmpresaControl.reset();
      this.dataFinalEmpresaControl.reset();
      this.minInitialEmpresaDate.setDate(new Date().getDate() - 180);
      return;
    } else {
      this.dataInicialGrupoControl.reset();
      this.dataFinalGrupoControl.reset();
      this.minInitialGrupoDate.setDate(new Date().getDate() - 180);
    }
  }

  onChangePeriodo(value: any, inicial: boolean) {
    this.periodoEmpresaControl.reset();
    if (inicial) {
      this.setaDataMinima(value, false);
      return;
    }

    this.verificaData(value, false);
  }

  setaDataMinima(dataFinal: any, grupos: boolean = true) {
    let data1;
    data1 = Utility.formatDate(dataFinal);
    const data1Split = data1.split('-');
    if (grupos) {
      this.minDateGrupo = new Date(
        data1Split[2],
        data1Split[1] - 1,
        data1Split[0]
      );
    } else {
      this.minDate = new Date(data1Split[2], data1Split[1] - 1, data1Split[0]);
    }
  }

  verificaData(dataFinal: any, grupos: boolean = true) {
    let data1;
    let data2;
    data1 = Utility.formatDate(
      grupos
        ? this.dataInicialGrupoControl.value
        : this.dataInicialEmpresaControl.value
    );
    data2 = Utility.formatDate(dataFinal);
    const data1Split = data1.split('-');
    const data2Split = data2.split('-');
    const novaData1 = data1Split.length > 1 ? new Date(
      data1Split[2],
      data1Split[1] - 1,
      data1Split[0]
    ) : null;
    const novaData2 = new Date(
      data2Split[2],
      data2Split[1] - 1,
      data2Split[0]
    );

    if (data1 !== '' && data2 !== '') {

      if (novaData1.getTime() <= novaData2.getTime()) {
        this.erroDataFinal = false;
      } else {
        this.erroDataFinal = true;
        if (grupos) {
          this.dataFinalGrupoControl.setValue('');
        } else {
          this.dataFinalEmpresaControl.setValue('');
        }
      }
    }

    novaData2.setDate(novaData2.getDate() - 180);
    if (grupos) {
      this.minInitialGrupoDate = novaData2;
      if (novaData1) { this.verificarDataMinima(novaData1, this.minInitialGrupoDate, this.dataInicialGrupoControl, this.erroDataFinal); }
      return;
    }

    this.minInitialEmpresaDate = novaData2;
    if (novaData1) { this.verificarDataMinima(novaData1, this.minInitialEmpresaDate, this.dataInicialEmpresaControl, this.erroDataFinalEmpresa); }
  }

  verificarDataMinima(dataInicial, minInitialDate: Date, dataInicialControl: FormControl, erroDataFinal: boolean) {
    if (dataInicial.getTime() >= minInitialDate.getTime()) {
      erroDataFinal = false;
    } else {
      erroDataFinal = true;
      dataInicialControl.setValue('');
    }
  }

  selectAll(fieldReturn: FilterFieldReturn) {
    this.selectAllOptions(
      this.statusEmpresaControl,
      fieldReturn.selected,
      this.fieldStatusEmpresas.options
    );
  }

  selectAllNome(fieldReturn: FilterFieldReturn) {
    this.selectAllOptions(
      this.nomeControl,
      fieldReturn.selected,
      this.fieldNome.options
    );
  }

  atualizarPagina() {
    this.refreshGrid = !this.refreshGrid;
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

  private carregarTiposRelatorio() {
    this.portalDominioService.obterPorTipo('SOLICITACAO_RELATORIO').subscribe(response => {
      this.nomeRelatorios = [];
      response.valorDominio.forEach(dominio => {
        this.nomeRelatorios.push(<FieldOption>{ label: dominio.valor, value: dominio.id });
      });

      this.fieldNome.options = this.nomeRelatorios;
    })
  }
}
