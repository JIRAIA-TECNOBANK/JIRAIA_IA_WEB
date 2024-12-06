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
import { FiltroAprovacaoCancelamentoNota } from '../../../../core/models/gestao-aprovacoes/filtro-aprovacao-cancelamento-nota.model';

@Component({
  selector: 'app-filtro-cancelamento-nf-nd',
  templateUrl: './filtro-cancelamento-nf-nd.component.html',
  styleUrls: ['./filtro-cancelamento-nf-nd.component.scss']
})
export class FiltroCancelamentoNfNdComponent {

  utility = Utility;

  pipe = new DatePipe('pt-BR');

  filtroCancelamento: FiltroConciliacao;

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
    id: 'dataReferencia',
    titulo: 'Por mês/ano',
    tipo: TipoFilterField.Datepicker,
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
    id: 'cancelamento-notas',
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
    let dataReferencia = this.pipe.transform(
      event.get('dataReferencia'),
      'yyyy-MM-dd'
    );

    let listaStatus: boolean[] = event.get(this.fieldStatus.id);
    let status = listaStatus != null ? (listaStatus.length == 1 ? listaStatus[0] : null) : null;

    this.filtroCancelamento = <FiltroAprovacaoCancelamentoNota>{
      EmpresaId: event.get(this.fieldNomeEmpresa.id),
      Uf: event.get(this.fieldUf.id),
      DataReferencia: dataReferencia,
      Status: status
    };

    let codigoEmpresa = event.get(this.fieldCodigoEmpresa.id);

    if (codigoEmpresa) {
      if (this.filtroCancelamento.EmpresaId == null) this.filtroCancelamento.EmpresaId = [];

      this.filtroCancelamento.EmpresaId.push(codigoEmpresa);
    }

    this.filtro.emit(this.filtroCancelamento);

    this.showRedefinirBtn = true;
  }

  redefinirFiltros() {
    this.filtroCancelamento = null;
    this.refreshGrid = !this.refreshGrid;
    this.showRedefinirBtn = false;
    this.filtro.emit(this.filtroCancelamento);
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
