import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Store } from '@ngrx/store';
import { forIn } from 'lodash';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { UsuariosService } from '../../../admin/services/usuarios.service';
import { DominioService } from '../../../crm/services/dominio.service';
import { EmpresasService } from '../../../crm/services/empresas.service';
import { TipoFormatoRelatorioFaturamentoDesc } from '../../core/common/tipo-formato-relatorio-faturamento-desc';
import { TipoModeloRelatorioFaturamentoDesc } from '../../core/common/tipo-modelo-relatorio-faturamento-desc';
import { TipoFormatoRelatorioFaturamento } from '../../core/enums/tipo-formato-relatorio-faturamento.enum';
import { TipoModeloRelatorioFaturamento } from '../../core/enums/tipo-modelo-relatorio-faturamento.enum';
import { FiltroRelatoriosFaturamento } from '../../core/models/relatorios/filtro-relatorios.model';
import { SolicitarRelatorioRequest } from '../../core/requests/relatorios/solicitar-relatorio.request';
import { RelatorioFinanceiroService } from '../../services/relatorio-financeiro.service';
import { DialogSolicitarRelatorioFaturamentoComponent } from './components/dialog-solicitar-relatorio-faturamento/dialog-solicitar-relatorio-faturamento.component';

@Component({
  selector: 'app-relatorios',
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.scss']
})
export class RelatoriosComponent implements OnInit {

  utility = Utility;
  pipe = new DatePipe('pt-BR');

  atualizarGrid: boolean = false;
  usuarioId: number;

  //#region Filtro
  filtroRelatorio: FiltroRelatoriosFaturamento;

  fieldNomeEmpresa: FilterField = <FilterField>{
    id: 'empresaNome',
    titulo: 'Por empresa',
    tipo: TipoFilterField.Checkbox,
    options: [],
    searchInput: true,
    showTooltip: true,
  };

  fieldMesCompetencia: FilterField = <FilterField>{
    id: 'mesCompetencia',
    titulo: 'Por mês/ano competência',
    tipo: TipoFilterField.Datepicker
  };

  fieldModelo: FilterField = <FilterField>{
    id: 'modelo',
    titulo: 'Por modelo',
    tipo: TipoFilterField.Checkbox,
    options: [],
    selectAllOptions: 'Todos',
  };

  fieldUf: FilterField = <FilterField>{
    id: 'Uf',
    titulo: 'Por UF',
    tipo: TipoFilterField.Checkbox,
    options: [],
    selectAllOptions: 'Todas',
  };

  fieldFormato: FilterField = <FilterField>{
    id: 'formato',
    titulo: 'Por formato',
    tipo: TipoFilterField.Checkbox,
    options: [],
    selectAllOptions: 'Todos',
  };

  filter: GridFilter = <GridFilter>{
    id: '',
    customFields: false,
    maxNumberFields: 5,
    fields: [
      this.fieldNomeEmpresa,
      this.fieldMesCompetencia,
      this.fieldModelo,
      this.fieldUf,
      this.fieldFormato
    ],
  };

  showRedefinirBtn: boolean = false;
  //#endregion

  constructor(private dialog: MatDialog,
    private notifierService: NotifierService,
    private relatorioService: RelatorioFinanceiroService,
    private store: Store<{ preloader: IPreloaderState }>,
    private usuarioService: UsuariosService,
    private empresaService: EmpresasService,
    private dominioService: DominioService) { }

  ngOnInit(): void {
    this.carregarUsuarioId();
    this.carregarEmpresas();
    this.carregarUfsLicenciamento();
    this.carregaModelosRelatorios();
    this.carregaFormatoRelatorios();
  }

  onSolicitarRelatorio() {
    const dialogRef = this.dialog.open(DialogSolicitarRelatorioFaturamentoComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'info'),
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((retorno: SolicitarRelatorioRequest | null) => {
      if (retorno) {
        this.store.dispatch(showPreloader({ payload: '' }))
        let request = <SolicitarRelatorioRequest>{
          empresaId: retorno.empresaId,
          modelo: retorno.modelo,
          uf: retorno.uf,
          formato: retorno.formato,
          usuarioId: this.usuarioId,
          tipoArquivo: retorno.tipoArquivo,
          dataReferencia: retorno.dataReferencia
        };

        this.relatorioService.solicitarRelatorioFaturamento(request).subscribe(response => {
          this.store.dispatch(closePreloader())
          if (response.errors) {
            this.notifierService.showNotification(response.errors[0].message, null, 'error');
            return;
          }

          this.atualizarGrid = !this.atualizarGrid;
          this.notifierService.showNotification('Relatório solicitado com sucesso! Acompanhe o processamento abaixo.', null, 'success');
        }, () => {
          this.store.dispatch(closePreloader())
          this.notifierService.showNotification('Não foi possível completar a solicitação!', null, 'error');
        })
      }
    });
  }

  search(event) {
    let empresasIds = event.get(this.fieldNomeEmpresa.id);
    let dataCompetencia = this.pipe.transform(event.get(this.fieldMesCompetencia.id), 'yyyy-MM-dd')
    let ufs = event.get(this.fieldUf.id);
    let modelos = event.get(this.fieldModelo.id);
    let formatos = event.get(this.fieldFormato.id);

    this.filtroRelatorio = <FiltroRelatoriosFaturamento>{
      empresasId: empresasIds,
      dataReferencia: dataCompetencia,
      ufs: ufs,
      modelos: modelos,
      formatos: formatos
    };

    this.showRedefinirBtn = true;
  }

  redefinirFiltros() {
    this.filtroRelatorio = null;
    this.atualizarGrid = !this.atualizarGrid;
    this.showRedefinirBtn = false;
  }

  searchFilterEmpresas(event: FieldOption) {
    let filtro = Utility.checkNumbersOnly(event.value);
    filtro = filtro === '0' ? (filtro = '') : filtro;
    this.carregarEmpresas(filtro);
  }

  carregarEmpresas(filtroEmpresa = '') {
    this.fieldNomeEmpresa.options = [];
    filtroEmpresa
      ? this.carregarEmpresasComFiltro(filtroEmpresa)
      : this.carregarEmpresasSemFiltro();
  }

  searchField(event) {
    if (event.label == this.fieldNomeEmpresa.id) this.carregarEmpresas(event.value);
  }

  private carregarUsuarioId() {
    let usuarioGuid = sessionStorage.getItem('userGuid');
    this.usuarioService.obterUsuarioPorGuid(usuarioGuid).subscribe(response => {
      if (response.id) {
        this.usuarioId = response.id;
      }
    });
  }

  private carregarUfsLicenciamento() {
    let options: FieldOption[] = [];

    this.dominioService.obterPorTipo('UF_DETRAN').subscribe((result) => {
      result.valorDominio.forEach((uf) => {
        options.push(<FieldOption>{
          value: uf.valor,
          label: uf.valor,
        });
      });

      this.fieldUf.options = options;
    });
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

  private carregarEmpresasSemFiltro() {
    this.empresaService.obterEmpresas(0, 10).subscribe(
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

  private carregaModelosRelatorios() {
    let options: FieldOption[] = [];

    forIn(TipoModeloRelatorioFaturamento, (value, key) => {
      if (isNaN(Number(key))) {
        options.push({
          value: value,
          label: this.retornarModelo(value)
        });

        this.fieldModelo.options = options;
      }
    })
  }

  private carregaFormatoRelatorios() {
    let options: FieldOption[] = [];

    forIn(TipoFormatoRelatorioFaturamento, (value, key) => {
      if (isNaN(Number(key))) {
        options.push({
          value: value,
          label: this.retornarFormato(value)
        });

        this.fieldFormato.options = options;
      }
    })
  }

  private retornarModelo(modeloId: TipoModeloRelatorioFaturamento) {
    return TipoModeloRelatorioFaturamentoDesc.get(modeloId);
  }

  private retornarFormato(formatoId: TipoFormatoRelatorioFaturamento) {
    return TipoFormatoRelatorioFaturamentoDesc.get(formatoId);
  }
}
