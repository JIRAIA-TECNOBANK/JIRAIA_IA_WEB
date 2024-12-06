import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { Utility } from 'src/app/core/common/utility';
import { Documento } from 'src/app/modules/sistemas/core/models/documento.model';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FilterFieldReturn } from 'src/app/shared/core/models/grid-filter/filter-field-return.model';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { Empresas } from '../../../../core/models/empresas/empresas.model';
import { ParametrizaDudasFiltro } from '../../../../core/models/taxas/parametriza-dudas-filtro.model';
import { EmpresasService } from '../../../../services/empresas.service';

@Component({
  selector: 'app-gestao-dudas',
  templateUrl: './gestao-dudas.component.html',
  styleUrls: ['./gestao-dudas.component.scss'],
})
export class GestaoDudasComponent implements OnInit {
  constructor(
    private empresaService: EmpresasService,
    private router: Router
  ) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) this.childstate = !val['url'].endsWith('gestao-dudas');
      if (!this.childstate) this.atualizarGrid = !this.atualizarGrid;
    });

  }

  atualizarGrid: boolean = false;

  filtro: ParametrizaDudasFiltro;

  filterOptionEmpresa: FieldOption[] = [];

  fieldEmpresa: FilterField = <FilterField>{
    id: 'empresa',
    titulo: 'Por empresa',
    tipo: TipoFilterField.Checkbox,
    options: this.filterOptionEmpresa,
    searchInput: true,
    showTooltip: true
  };

  fieldCnpj: FilterField = <FilterField>{
    id: 'cnpj',
    titulo: 'Por CNPJ',
    tipo: TipoFilterField.Text,
    validators: [Validators.minLength(3)],
  };

  fieldStatus: FilterField = <FilterField>{
    id: 'ativo',
    titulo: 'Por status',
    tipo: TipoFilterField.Checkbox,
    selectAllOptions: 'Todas',
    options: [
      <FieldOption>{ value: true, label: 'Parametrizadas' },
      <FieldOption>{ value: false, label: 'Não parametrizadas' },
    ],
  };

  fieldAmount: FilterField = <FilterField>{
    id: 'amount',
    titulo: 'Por quantidade',
    tipo: TipoFilterField.Text,
    validators: Validators.pattern('^[0-9]*$'),
  };

  filter: GridFilter = <GridFilter>{
    id: 'dudas',
    customFields: true,
    fields: [
      this.fieldEmpresa,
      this.fieldCnpj,
      this.fieldStatus,
      this.fieldAmount,
    ],
  };

  empresaControl: FormControl;
  empresaSearchControl: FormControl;
  cnpjControl: FormControl;
  statusControl: FormControl;
  amountControl: FormControl;

  showRedefinirBtn: boolean = false;
  redefinirField: boolean = false;

  childstate: boolean = false;

  ngOnInit(): void {
    this.carregarEmpresasSemFiltro();
  }

  search(event) {
    let empresa = event.get(this.fieldEmpresa.id);
    let ativo = event.get(this.fieldStatus.id);
    let cnpj = event.get(this.fieldCnpj.id);
    let quantidade = event.get(this.fieldAmount.id);
    this.filtro = <ParametrizaDudasFiltro>{
      empresaId: empresa != null ? empresa : '',
      ativo: ativo ? (ativo.length > 1 ? null : ativo[0]) : null,
      cnpj: cnpj != null ? Utility.checkNumbersOnly(cnpj) : '',
      quantidade: quantidade != null ? quantidade : '',
    };

    this.showRedefinirBtn = true;
  }

  redefinir() {
    this.filtro = null;
    this.showRedefinirBtn = false;
    this.redefinirField = !this.redefinirField;
  }

  setCustomControls(event: Map<string, AbstractControl>) {
    this.empresaControl = event.get(this.fieldEmpresa.id) as FormControl;
    this.empresaSearchControl = event.get(
      this.fieldEmpresa.id + '_search'
    ) as FormControl;
    this.statusControl = event.get(this.fieldStatus.id) as FormControl;
    this.cnpjControl = event.get(this.fieldCnpj.id) as FormControl;
    this.amountControl = event.get(this.fieldAmount.id) as FormControl;
  }

  selectAll(fieldReturn: FilterFieldReturn) {
    this.selectAllOptions(
      this.statusControl,
      fieldReturn.selected,
      this.fieldStatus.options
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

  // Call Utility Function
  searchFilter(event: FieldOption) {
    let filtro = Utility.checkNumbersOnly(event.value);
    filtro = filtro === '0' ? (filtro = '') : filtro;
    if (filtro) {
      this.carregarEmpresasComFiltro(filtro);
      return;
    }

    this.carregarEmpresasSemFiltro();
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

          this.fieldEmpresa.options = options;
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

          this.fieldEmpresa.options = options;
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
}
