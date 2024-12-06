import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { EmpresasService } from 'src/app/modules/sistemas/sub-modules/crm/services/empresas.service';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { FiltroConciliacao } from '../../../../core/models/faturamento-conciliado/filtro-conciliacao.model';
import { FiltroAprovacaoCestaServico } from '../../../../core/models/gestao-aprovacoes/filtro-aprovacao-cesta-servico.model';

@Component({
  selector: 'app-filtro-cesta-servico',
  templateUrl: './filtro-cesta-servico.component.html',
  styleUrls: ['./filtro-cesta-servico.component.scss']
})
export class FiltroCestaServicoComponent {

  utility = Utility;

  pipe = new DatePipe('pt-BR');

  filtroAprovacaoCesta: FiltroAprovacaoCestaServico;

  fieldNomeEmpresa: FilterField = <FilterField>{
    id: 'empresaNome',
    titulo: 'Por empresa',
    tipo: TipoFilterField.Checkbox,
    options: [],
    searchInput: true,
    showTooltip: true,
  };

  fieldCodigoEmpresa: FilterField = <FilterField>{
    id: 'empresaCodigo',
    titulo: 'Por código',
    tipo: TipoFilterField.Text,
    validators: Validators.pattern('^[0-9]*$'),
  };

  fieldUf: FilterField = <FilterField>{
    id: 'Uf',
    titulo: 'Por UF',
    tipo: TipoFilterField.Checkbox,
    options: [],
    selectAllOptions: 'Todas',
  };

  fieldDataReferencia: FilterField = <FilterField>{
    id: 'periodo',
    titulo: 'Por período',
    tipo: TipoFilterField.ExactDate,
  };

  fieldStatus: FilterField = <FilterField>{
    id: 'Status',
    titulo: 'Por status',
    tipo: TipoFilterField.Checkbox,
    options: [
      <FieldOption>{ label: 'Aprovado', value: true },
      <FieldOption>{ label: 'Aguardando aprovação', value: false }
    ],
    selectAllOptions: 'Todos',
    orderOptions: false,
  };

  filter: GridFilter = <GridFilter>{
    id: 'cesta-servico',
    customFields: false,
    maxNumberFields: 5,
    fields: [
      this.fieldNomeEmpresa,
      this.fieldCodigoEmpresa,
      this.fieldUf,
      this.fieldDataReferencia,
      this.fieldStatus,
    ],
  };

  refreshGrid: boolean = false;
  showRedefinirBtn: boolean = false;

  @Output('filtro') filtro: EventEmitter<FiltroConciliacao> =
    new EventEmitter<FiltroConciliacao>();

  @Input('ufOptions') set setUfOptions(value) {
    this.fieldUf.options = value;
  }

  @Input('empresaOptions') set setEmpresaOptions(value) {
    this.fieldNomeEmpresa.options = value;
  }

  constructor(private empresaService: EmpresasService) { }

  search(event) {
    let periodo = this.pipe.transform(
      event.get('periodo'),
      'yyyy-MM-dd'
    );

    let listaStatus: boolean[] = event.get(this.fieldStatus.id);
    let status = listaStatus != null ? (listaStatus.length == 1 ? listaStatus[0] : null) : null;

    this.filtroAprovacaoCesta = <FiltroAprovacaoCestaServico>{
      EmpresaId: event.get(this.fieldNomeEmpresa.id),
      Uf: event.get(this.fieldUf.id),
      Periodo: periodo,
      Status: status
    };

    let codigoEmpresa = event.get(this.fieldCodigoEmpresa.id);

    if (codigoEmpresa) {
      if (this.filtroAprovacaoCesta.EmpresaId == null) this.filtroAprovacaoCesta.EmpresaId = [];

      this.filtroAprovacaoCesta.EmpresaId.push(codigoEmpresa);
    }
    this.filtro.emit(this.filtroAprovacaoCesta);

    this.showRedefinirBtn = true;
  }

  redefinirFiltros() {
    this.filtroAprovacaoCesta = null;
    this.refreshGrid = !this.refreshGrid;
    this.showRedefinirBtn = false;
    this.filtro.emit(this.filtroAprovacaoCesta);
  }

  searchField(event) {
    if (event.label == this.fieldNomeEmpresa.id) this.carregarEmpresas(event.value);
  }

  searchFilterEmpresas(event: FieldOption) {
    let filtro = Utility.checkNumbersOnly(event.value);
    filtro = filtro === '0' ? (filtro = '') : filtro;
    this.carregarEmpresas(filtro);
  }

  carregarEmpresas(filtroEmpresa = '') {
    this.fieldNomeEmpresa.options = [];
    this.carregarEmpresasComFiltro(filtroEmpresa)
  }

  private carregarEmpresasComFiltro(filtroEmpresa) {
    this.empresaService.obterEmpresasFiltro(0, 10, filtroEmpresa).subscribe(
      (response) => {
        if (response.isSuccessful) {
          let options = [];
          response.empresas.forEach((empresa) => {
            options.push(<FieldOption>{
              value: empresa.id,
              label: Utility.getClienteNomeCnpj(empresa),
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
}
