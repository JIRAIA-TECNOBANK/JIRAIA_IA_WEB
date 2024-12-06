import {
  Component,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { MatLegacyTabGroup as MatTabGroup } from '@angular/material/legacy-tabs';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';

import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FilterCustomField } from 'src/app/shared/core/models/grid-filter/filter-custom-field.model';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { EmpresaFiltro } from '../../../../core/models/empresas/empresa-filtro.model';
import { GruposEconomicosFiltro } from '../../../../core/models/grupos-economicos/grupos-economicos-filtro.model';

import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { RotasAuxiliares } from 'src/app/core/common/rotas-auxiliares';
import { Utility } from 'src/app/core/common/utility';
import { Documento } from 'src/app/modules/sistemas/core/models/documento.model';
import { PortalDominioService } from 'src/app/modules/sistemas/sub-modules/admin/services/_portal/portal-dominio.service';
import { FilterFieldReturn } from 'src/app/shared/core/models/grid-filter/filter-field-return.model';
import { Permissoes } from '../../../../../../../../core/common/permissoes';
import { Empresas } from '../../../../core/models/empresas/empresas.model';
import { DominiosResponse } from '../../../../core/responses/dominios/dominios.response';
import { EmpresasService } from '../../../../services/empresas.service';
import { GruposEconomicosService } from '../../../../services/grupos-economicos.service';

@Component({
  selector: 'app-empresas',
  templateUrl: './listar-empresas.component.html',
  styleUrls: ['./listar-empresas.component.scss'],
})
export class ListarEmpresasComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  @ViewChildren('childTabs') childTabs: QueryList<MatTabGroup>;

  activeIndex: number = 0;
  childstate: boolean = false;
  gruposAba: boolean = true;

  activeTab: number = 0;
  pesquisaEmpresa: string = null;

  filterOptionPeriodo: FieldOption[] = [];
  filterOptionEmpresa: FieldOption[] = [];

  minDate: Date;
  maxDate: Date;
  minDateGrupo: Date;
  maxDateGrupo: Date;
  erroDataFinal: boolean = false;
  erroDataFinalEmpresa: boolean = false;
  requiredFieldsError: boolean = false;

  minInitialEmpresaDate: Date;
  minInitialGrupoDate: Date;

  //#region Filtro Grupos

  filtroGrupos: GruposEconomicosFiltro;

  fieldCodigoGrupo: FilterField = <FilterField>{
    id: 'grupoCodigo',
    titulo: 'Por código',
    tipo: TipoFilterField.Text,
    validators: Validators.pattern('^[0-9]*$'),
  };

  fieldNomeGrupo: FilterField = <FilterField>{
    id: 'grupoNome',
    titulo: 'Por grupo',
    tipo: TipoFilterField.Checkbox,
    options: [],
    searchInput: true,
    showTooltip: true
  };

  fieldPeriodoGrupo: FilterField = <FilterField>{
    id: 'grupoPeriodo',
    titulo: 'Por período',
    tipo: TipoFilterField.Period,
    options: this.filterOptionPeriodo,
    customFields: [
      <FilterCustomField>{ id: 'De' },
      <FilterCustomField>{ id: 'Ate' },
    ],
  };

  fieldStatusGrupo: FilterField = <FilterField>{
    id: 'ativo',
    titulo: 'Por status',
    tipo: TipoFilterField.Checkbox,
    selectAllOptions: 'Todos',
    options: [
      <FieldOption>{ value: true, label: 'Ativos' },
      <FieldOption>{ value: false, label: 'Inativos' },
    ],
  };

  fieldDocumentoEmpresaGrupo: FilterField = <FilterField>{
    id: 'empresaCPNJGrupo',
    titulo: 'Por CNPJ',
    tipo: TipoFilterField.Text,
    validators: [Validators.minLength(3), Utility.checkDocument(), Validators.maxLength(18)],
  };

  filterGrupos: GridFilter = <GridFilter>{
    id: 'grupos-economicos',
    customFields: true,
    fields: [
      this.fieldCodigoGrupo,
      this.fieldNomeGrupo,
      this.fieldPeriodoGrupo,
      this.fieldStatusGrupo,
      this.fieldDocumentoEmpresaGrupo
    ],
  };

  codigoGrupoControl: FormControl;
  grupoNomeControl: FormControl;
  grupoNomeSearchControl: FormControl;
  periodoGrupoControl: FormControl;
  dataInicialGrupoControl: FormControl;
  dataFinalGrupoControl: FormControl;
  statusGrupoControl: FormControl;
  documentoEmpresaGrupo: FormControl;

  showRedefinirGruposBtn: boolean = false;

  //#endregion

  //#region Filtro Empresas

  filtroEmpresas: EmpresaFiltro;

  fieldCodigoEmpresa: FilterField = <FilterField>{
    id: 'empresaCodigo',
    titulo: 'Por código',
    tipo: TipoFilterField.Text,
    validators: Validators.pattern('^[0-9]*$'),
  };

  fieldNomeEmpresa: FilterField = <FilterField>{
    id: 'empresaNome',
    titulo: 'Por empresa',
    tipo: TipoFilterField.Checkbox,
    options: this.filterOptionEmpresa,
    searchInput: true,
    showTooltip: true
  };

  fieldDocumentoEmpresa: FilterField = <FilterField>{
    id: 'empresaCPNJ',
    titulo: 'Por CNPJ',
    tipo: TipoFilterField.Text,
    validators: [Validators.minLength(3), Utility.checkDocument(), Validators.maxLength(18)],
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
    id: 'ativo',
    titulo: 'Por status',
    tipo: TipoFilterField.Checkbox,
    selectAllOptions: 'Todos',
    options: [
      <FieldOption>{ value: true, label: 'Ativos' },
      <FieldOption>{ value: false, label: 'Inativos' },
    ],
  };

  filterEmpresas: GridFilter = <GridFilter>{
    id: 'empresas',
    customFields: true,
    fields: [
      this.fieldCodigoEmpresa,
      this.fieldNomeEmpresa,
      this.fieldDocumentoEmpresa,
      this.fieldPeriodoEmpresa,
      this.fieldStatusEmpresas,
    ],
  };

  codigoEmpresaControl: FormControl;
  empresaNomeControl: FormControl;
  empresaNomeSearchControl: FormControl;
  documentoEmpresaControl: FormControl;
  periodoEmpresaControl: FormControl;
  dataInicialEmpresaControl: FormControl;
  dataFinalEmpresaControl: FormControl;
  statusEmpresaControl: FormControl;

  refreshGruposGrid: boolean = false;
  refreshEmpresasGrid: boolean = false;

  //#endregion

  constructor(
    private router: Router,
    private portalDominioService: PortalDominioService,
    private empresaService: EmpresasService,
    private grupoEconomicoService: GruposEconomicosService,
    private activatedRoute: ActivatedRoute
  ) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) {
        this.childstate = val['urlAfterRedirects'].includes(`organizacoes/${RotasAuxiliares.GRUPOS_ECONOMICOS}`) || val['urlAfterRedirects'].includes(`organizacoes/${RotasAuxiliares.EMPRESAS}`);
        if (this.activatedRoute.snapshot.queryParams?.tab) { this.activeIndex = this.activatedRoute.snapshot.queryParams?.tab === 'empresas' ? 1 : 0; }
      }
    });

    this.maxDateGrupo = new Date();
    this.maxDate = new Date();
    this.minInitialEmpresaDate = new Date();
    this.minInitialGrupoDate = new Date();
  }

  ngOnInit(): void {
    this.carregarPeriodo();
    this.carregarEmpresas();
    this.carregarGrupos();
    this.minInitialEmpresaDate.setDate(this.minInitialEmpresaDate.getDate() - 180);
    this.minInitialGrupoDate.setDate(this.minInitialGrupoDate.getDate() - 180);

    this.onChangeTab();
  }

  ngAfterViewInit() {
    this.childTabs?.forEach((childTab) => {
      childTab.realignInkBar();
    });
  }

  onTabChange(event: any) {
    this.activeIndex = event.index;

    this.onChangeTab();
  }

  searchGrupos(event) {
    let campoCodigo = event.get(this.fieldCodigoGrupo.id);
    let campoGrupo = event.get(this.fieldNomeGrupo.id);
    let gruposIdArray = this.createIdArray(campoCodigo, campoGrupo);
    let cnpj = event.get(this.fieldDocumentoEmpresaGrupo.id);

    let dataInicio = event.get('De');
    let dataFim = event.get('Ate');
    let campoStatus = event.get(this.fieldStatusGrupo.id);
    this.filtroGrupos = <GruposEconomicosFiltro>{
      grupoEconomicoId: gruposIdArray != null ? gruposIdArray : '',
      ativo: campoStatus ? (campoStatus.length > 1 ? '' : campoStatus[0]) : '',
      dataInicio: dataInicio != null ? dataInicio : '',
      dataFim: dataFim != null ? dataFim : '',
      cnpj: cnpj != null ? Utility.checkNumbersOnly(cnpj) : '',
    };

    this.showRedefinirGruposBtn = true;
  }

  searchEmpresas(event) {
    let primeiroArray = event.get(this.fieldCodigoEmpresa.id);
    let segundoArray = event.get(this.fieldNomeEmpresa.id);

    let empresaId = this.createIdArray(primeiroArray, segundoArray);
    let cnpj = event.get(this.fieldDocumentoEmpresa.id);
    let dataInicio = event.get('De');
    let dataFim = event.get('Ate');
    let ativo = event.get(this.fieldStatusEmpresas.id);

    this.filtroEmpresas = <EmpresaFiltro>{
      empresaId: empresaId != null ? empresaId : '',
      cnpj: cnpj != null ? Utility.checkNumbersOnly(cnpj) : '',
      dataInicio: dataInicio != null ? dataInicio : '',
      dataFim: dataFim != null ? dataFim : '',
      ativo: ativo ? (ativo.length > 1 ? '' : ativo[0]) : ''
    };
    this.showRedefinirGruposBtn = true;
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

  redefinirGrupos() {
    this.filtroGrupos = null;
    this.refreshGruposGrid = !this.refreshGruposGrid;
    this.showRedefinirGruposBtn = false;
    this.minInitialGrupoDate.setDate(new Date().getDate() - 180);
  }

  redefinirEmpresas() {
    this.filtroEmpresas = null;
    this.refreshEmpresasGrid = !this.refreshEmpresasGrid;
    this.showRedefinirGruposBtn = false;
    this.minInitialEmpresaDate.setDate(new Date().getDate() - 180);
  }

  goTo(rota: string, grupo: boolean) {
    if (grupo) {
      this.router.navigate([rota]);
      return;
    }

    this.router.navigate([rota]);
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

  carregarGrupos(filtroGrupo = '') {
    filtroGrupo
      ? this.carregarGruposComFiltro(filtroGrupo)
      : this.carregarGruposSemFiltro();
  }

  private carregarGruposComFiltro(filtroGrupo) {
    let filtro = <EmpresaFiltro>{ nome: filtroGrupo, };
    this.grupoEconomicoService
      .obterGruposEconomicos(0, 10, filtro)
      .subscribe(
        (response) => {
          if (response.isSuccessful) {
            let options = [];
            response.gruposEconomicos.forEach((grupo) => {
              options.push(<FieldOption>{
                value: grupo.id,
                label: grupo.nome,
              });
            });

            this.fieldNomeGrupo.options = options;
          }

          response.errors.forEach((error) => {
            console.info(`${error.code}-${error.message}`);
          });
        },
        (error) => console.info(error)
      );
  }

  private carregarGruposSemFiltro() {
    this.grupoEconomicoService.obterGruposEconomicos(0, 10).subscribe(
      (response) => {
        if (response.isSuccessful) {
          let options = [];
          response.gruposEconomicos.forEach((grupo) => {
            options.push(<FieldOption>{
              value: grupo.id,
              label: grupo.nome,
            });
          });
          this.fieldNomeGrupo.options = options;
        }

        response.errors.forEach((error) => {
          console.info(`${error.code}-${error.message}`);
        });
      },
      (error) => console.info(error)
    );
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

  setCustomControls(event: Map<string, AbstractControl>) {
    this.codigoEmpresaControl = event.get(
      this.fieldCodigoEmpresa.id
    ) as FormControl;
    this.empresaNomeControl = event.get(
      this.fieldNomeEmpresa.id
    ) as FormControl;
    this.empresaNomeSearchControl = event.get(
      this.fieldNomeEmpresa.id + '_search'
    ) as FormControl;
    this.documentoEmpresaControl = event.get(
      this.fieldDocumentoEmpresa.id
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

  cleanDatesGrupos() {
    this.dataInicialGrupoControl.reset();
    this.dataFinalGrupoControl.reset();
  }

  cleanDates() {
    this.dataInicialEmpresaControl.reset();
    this.dataFinalEmpresaControl.reset();
  }

  setGrupoCustomControls(event: Map<string, AbstractControl>) {
    this.codigoGrupoControl = event.get(
      this.fieldCodigoGrupo.id
    ) as FormControl;
    this.grupoNomeControl = event.get(this.fieldNomeGrupo.id) as FormControl;
    this.grupoNomeSearchControl = event.get(
      this.fieldNomeGrupo.id + '_search'
    ) as FormControl;
    this.periodoGrupoControl = event.get(
      this.fieldPeriodoGrupo.id
    ) as FormControl;
    this.dataInicialGrupoControl = event.get(
      this.fieldPeriodoGrupo.customFields[0].id
    ) as FormControl;
    this.dataFinalGrupoControl = event.get(
      this.fieldPeriodoGrupo.customFields[1].id
    ) as FormControl;
    this.statusGrupoControl = event.get(
      this.fieldStatusGrupo.id
    ) as FormControl;
    this.documentoEmpresaGrupo = event.get(
      this.fieldDocumentoEmpresaGrupo.id
    ) as FormControl;
  }

  searchFilter(event: FieldOption) {
    let filtro = Utility.checkNumbersOnly(event.value);
    filtro = filtro === '0' ? filtro = '' : filtro;
    this.carregarGrupos(filtro);
  }

  searchFilterEmpresas(event: FieldOption) {
    let filtro = Utility.checkNumbersOnly(event.value);
    filtro = filtro === '0' ? filtro = '' : filtro;
    this.carregarEmpresas(filtro);
  }

  onChangePeriodoGrupo(value: any, inicial: boolean) {
    this.periodoGrupoControl.reset();

    if (inicial) {
      this.setaDataMinima(value);
      return;
    }

    this.verificaData(value);
  }

  onChangePeriodo(value: any, inicial: boolean) {
    this.periodoEmpresaControl.reset();
    if (inicial) {
      this.setaDataMinima(value, false);
      return;
    }

    this.verificaData(value, false);
  }

  stopMatMenuClosing(event: KeyboardEvent) {
    event.stopPropagation();
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

  public getElementId(
    tipoElemento: number,
    nomeElemento: string,
    guidElemento: any = null
  ): string {
    return Utility.getElementId(tipoElemento, nomeElemento, guidElemento);
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

  stopPropagation(event) {
    event.stopPropagation();
  }

  selectAllGrupo(fieldReturn: FilterFieldReturn) {
    this.selectAllOptions(
      this.statusGrupoControl,
      fieldReturn.selected,
      this.fieldStatusGrupo.options
    );
  }

  selectAll(fieldReturn: FilterFieldReturn) {
    this.selectAllOptions(
      this.statusEmpresaControl,
      fieldReturn.selected,
      this.fieldStatusEmpresas.options
    );
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

  private onChangeTab() {
    const queryParams: Params = { tab: this.activeIndex == 0 ? 'grupos-economicos' : 'empresas' };
    this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: queryParams });
  }
}
