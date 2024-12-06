import { Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { forIn } from 'lodash';
import * as _moment from 'moment';
import { Moment } from 'moment';
import { Utility } from 'src/app/core/common/utility';
import { Detran } from 'src/app/modules/sistemas/sub-modules/crm/core/models/empresas/detran.model';
import { DominioService } from 'src/app/modules/sistemas/sub-modules/crm/services/dominio.service';
import { EmpresasService } from 'src/app/modules/sistemas/sub-modules/crm/services/empresas.service';
import { SortByPipe } from 'src/app/shared/pipes/sort-by.pipe';
import { TipoFormatoRelatorioFaturamentoDesc } from '../../../../core/common/tipo-formato-relatorio-faturamento-desc';
import { TipoModeloRelatorioFaturamentoDesc } from '../../../../core/common/tipo-modelo-relatorio-faturamento-desc';
import { TipoArquivoRelatorioFaturamento } from '../../../../core/enums/tipo-arquivo-relatorio-faturamento.enum';
import { TipoFormatoRelatorioFaturamento } from '../../../../core/enums/tipo-formato-relatorio-faturamento.enum';
import { TipoModeloRelatorioFaturamento } from '../../../../core/enums/tipo-modelo-relatorio-faturamento.enum';
import { EmpresaFaturamento } from '../../../../core/models/empresa/empresa-faturamento.model';
import { SolicitarRelatorioRequest } from '../../../../core/requests/relatorios/solicitar-relatorio.request';
import { EmpresaFaturamentoService } from '../../../../services/empresa.service';

const moment = _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
  selector: 'app-dialog-solicitar-relatorio-faturamento',
  templateUrl: './dialog-solicitar-relatorio-faturamento.component.html',
  styleUrls: ['./dialog-solicitar-relatorio-faturamento.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class DialogSolicitarRelatorioFaturamentoComponent implements OnInit {

  utility = Utility;
  date = new FormControl(moment());

  formulario = this.fb.group({
    modelo: [null, Validators.required],
    formato: [null, Validators.required],
    uf: [{ value: null, disabled: true }, Validators.required],
    extensao: [null, Validators.required],
    empresaNome: [null, Validators.required],
    empresaId: [null, Validators.required],
    mes: [null],
    ano: [null, Validators.min(2024)],
    dataCompetencia: [null]
  });

  meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
  ];

  modelosRelatorios: any = [];
  formatos: any = [];
  extensoes: any = [];

  empresas: EmpresaFaturamento[] = [];
  empresasFiltradas: EmpresaFaturamento[] = [];
  detrans: Detran[] = [];
  sortPipe = new SortByPipe();

  constructor(private fb: UntypedFormBuilder,
    private empresaService: EmpresasService,
    private empresaFaturamentoService: EmpresaFaturamentoService,
    private dominioService: DominioService) { }

  ngOnInit(): void {
    this.carregarEmpresas();

    this.formulario.get('modelo').valueChanges.subscribe(value => {
      this.carregaRegrasPorModelo(value);
    })

    this.carregaModelosRelatorios();
    this.carregaFormatoRelatorios();
    this.carregaExtensaoRelatorios();
  }

  retornarAnoAtual() {
    return new Date().getFullYear();
  }

  chosenYearHandler(normalizedYear: Moment) {
    const ctrlValue = this.date.value;
    ctrlValue.year(normalizedYear.year());
    this.formulario.get('dataCompetencia').setValue(ctrlValue);
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value;
    ctrlValue.month(normalizedMonth.month());
    this.formulario.get('dataCompetencia').setValue(ctrlValue);
    datepicker.close();
  }

  habilitaDataCompetencia() {
    return this.formulario.get('modelo').value != null
      && this.formulario.get('modelo').value !== TipoModeloRelatorioFaturamento.PreviaFaturamento
      && this.formulario.get('modelo').value !== TipoModeloRelatorioFaturamento.Historico
      && this.formulario.get('modelo').value !== TipoModeloRelatorioFaturamento.PrecosPrivados;
  }

  verificarCampoObrigatorio(control: string) {
    return (this.formulario.get(control).value && this.formulario.get(control).disabled) || this.formulario.get(control).enabled;
  }

  private carregaRegrasPorModelo(modelo: TipoModeloRelatorioFaturamento) {
    this.carregarValorPadrao(modelo);

    if (modelo == TipoModeloRelatorioFaturamento.Fechamento) {
      this.formulario.get('dataCompetencia').enable();
      return;
    }

    if (modelo == TipoModeloRelatorioFaturamento.PreviaFaturamento) {
      this.formulario.get('dataCompetencia').reset();
      this.formulario.get('dataCompetencia').disable();
      return;
    }

    this.formulario.get('empresaNome').disable();
    this.formulario.get('empresaId').disable();

    if (modelo == TipoModeloRelatorioFaturamento.OperacoesContabilizadasPrejuizo) {
      this.carregaFormatoPadrao(TipoFormatoRelatorioFaturamento.Sintetico);
      this.formulario.get('dataCompetencia').enable();
      this.formulario.get('uf').disable();
      return
    }

    if (modelo == TipoModeloRelatorioFaturamento.Historico) {
      this.carregaFormatoPadrao(TipoFormatoRelatorioFaturamento.Analitico);
      this.carregarTodasUfs();
      return
    }

    if (modelo == TipoModeloRelatorioFaturamento.PrecosPrivados) {
      this.carregaFormatoPadrao(TipoFormatoRelatorioFaturamento.Sintetico);
      this.formulario.get('dataCompetencia').disable();
      this.formulario.get('uf').disable();
      return
    }

    if (modelo == TipoModeloRelatorioFaturamento.OperacoesCobradas) {
      this.carregaFormatoPadrao(TipoFormatoRelatorioFaturamento.Sintetico);
      this.formulario.get('dataCompetencia').enable();
      this.formulario.get('uf').disable();
      this.date = new FormControl(moment().subtract(1, 'months'));
      return;
    }

    if (modelo == TipoModeloRelatorioFaturamento.FechamentoDetrans) {
      this.formulario.get('extensao').patchValue(TipoArquivoRelatorioFaturamento.xlsx);
      this.formulario.get('extensao').disable();
      this.formulario.get('formato').reset();
      this.formulario.get('formato').disable();
      this.carregarTodasUfs();
      return;
    }

    if (modelo == TipoModeloRelatorioFaturamento.DescontosNFND) {
      this.carregaFormatoPadrao(TipoFormatoRelatorioFaturamento.Analitico);
      this.formulario.get('dataCompetencia').enable();
      this.formulario.get('uf').disable();
      this.formulario.get('extensao').patchValue(TipoArquivoRelatorioFaturamento.xlsx);
      this.formulario.get('extensao').disable();
      return;
    }

    this.formulario.get('formato').reset();
    this.formulario.get('formato').enable();
  }

  private carregarValorPadrao(modelo: TipoModeloRelatorioFaturamento) {
    this.formulario.get('uf').reset();
    this.formulario.get('empresaNome').reset();
    this.formulario.get('empresaId').reset();
    this.formulario.get('formato').reset();

    this.formulario.get('uf').disable();
    this.formulario.get('empresaNome').enable();
    this.formulario.get('empresaId').enable();
    this.formulario.get('extensao').enable();
    this.formulario.get('formato').enable();

    this.date = new FormControl(moment());

    this.extensoes = [];
    let excecao = null;
    if (modelo == TipoModeloRelatorioFaturamento.Fechamento || modelo == TipoModeloRelatorioFaturamento.PreviaFaturamento) {
      excecao = TipoArquivoRelatorioFaturamento.csv;
    }

    this.carregaExtensaoRelatorios(excecao);
  }

  private carregaFormatoPadrao(formato: TipoFormatoRelatorioFaturamento) {
    this.formulario.get('formato').patchValue(formato);
    this.formulario.get('formato').disable();
  }

  private carregaModelosRelatorios() {
    forIn(TipoModeloRelatorioFaturamento, (value, key) => {
      if (isNaN(Number(key))) {
        this.modelosRelatorios.push({
          value: value,
          descricao: this.retornarModelo(value)
        })
      }
    })
  }

  private carregaFormatoRelatorios() {
    forIn(TipoFormatoRelatorioFaturamento, (value, key) => {
      if (isNaN(Number(key))) {
        this.formatos.push({
          value: value,
          descricao: this.retornarFormato(value)
        })
      }
    })
  }

  private carregaExtensaoRelatorios(excecao: TipoArquivoRelatorioFaturamento = null) {
    forIn(TipoArquivoRelatorioFaturamento, (value, key) => {
      if (isNaN(Number(key))) {
        if (excecao) {
          if (value == excecao) return;
        }

        this.extensoes.push({
          value: value,
          descricao: key.toUpperCase()
        })
      }
    })
  }

  retornarRequest() {
    let dataReferencia = new Date();

    if (this.habilitaDataCompetencia()) {
      let dataAux = new Date(this.formulario.get('dataCompetencia').value)
      dataReferencia = new Date(dataAux.getFullYear(), dataAux.getMonth(), 1, 0, 0, 0);
    }

    let formato = this.formulario.get('formato').value || (this.formulario.get('modelo').value == TipoModeloRelatorioFaturamento.FechamentoDetrans ? 1 : null);
    let uf = this.formulario.get('uf').value == 'todas' ? "" : this.formulario.get('uf').value;

    let request = <SolicitarRelatorioRequest>{
      empresaId: this.formulario.get('empresaId').value || 0,
      modelo: this.formulario.get('modelo').value,
      uf: uf,
      formato: formato,
      usuarioId: null,
      tipoArquivo: this.formulario.get('extensao').value,
      dataReferencia: dataReferencia
    };

    return request;
  }

  retornarModelo(modeloId: TipoModeloRelatorioFaturamento) {
    return TipoModeloRelatorioFaturamentoDesc.get(modeloId);
  }

  retornarFormato(formatoId: TipoFormatoRelatorioFaturamento) {
    return TipoFormatoRelatorioFaturamentoDesc.get(formatoId);
  }

  carregarEmpresas(filtro: string = null) {
    this.formulario.get('uf').disable();

    if (filtro) {
      if (filtro.length >= 3) {
        const valueInput = filtro.toLocaleLowerCase()

        this.empresaFaturamentoService.obterEmpresasFiltro(0, 10, Utility.checkNumbersOnly(valueInput)).subscribe(response => {
          if (response.isSuccessful) {
            this.empresas = response.empresas.items;
            this.formatarEmpresas(response.empresas.items);
          }
        })
        return;
      }
    }

    this.empresaFaturamentoService.obterEmpresasFiltro(0, 10, '').subscribe(response => {
      if (response.isSuccessful) {
        this.empresas = response.empresas.items;
        this.formatarEmpresas(response.empresas.items);
      }
    });
  }

  selecionaEmpresaId() {
    let empresaSelecionada = this.formulario.get('empresaNome').value;
    if (!empresaSelecionada) {
      this.formulario.get('empresaId').reset();
      return;
    }

    let empresaTxt = this.formulario.get('empresaNome').value.split(' - ');
    let cnpj = this.formulario.get('empresaNome').value.split(' - ')[empresaTxt.length - 1];

    if (!cnpj) {
      this.formulario.get('empresaId').reset();
      return;
    }

    let empresaCnpj = this.empresas.filter(e => Utility.checkNumbersOnly(e.cnpj).indexOf(Utility.checkNumbersOnly(cnpj)) > -1)[0];
    if (!empresaCnpj) {
      this.formulario.get('empresaId').reset();
      return;
    }

    this.formulario.get('empresaId').setValue(empresaCnpj.empresaId);
    this.getDetranUfs(empresaCnpj.empresaId);
  }

  getDetranUfs(empresaId: number) {
    this.formulario.get('uf').reset();
    this.detrans = [];

    this.empresaService.obterUfsProdutoEmpresa(empresaId).subscribe(result => {
      if (result?.detrans?.length > 0) {
        result.detrans.sort((a, b) => { return (a.ativo ? 0 : 1) - (b.ativo ? 0 : 1) });
        this.detrans = this.sortPipe.transform(result.detrans.filter(d => d.ativo), 'asc', 'ufDetran');
        this.detrans.push(...this.sortPipe.transform(result.detrans.filter(d => !d.ativo), 'asc', 'ufDetran'));
      }
      this.formulario.get('uf').enable();
    });
  }

  private formatarEmpresas(empresas: EmpresaFaturamento[]) {
    let empresasLista = empresas;
    empresasLista.forEach(empresa => { empresa.cnpj = Utility.formatCnpj(empresa.cnpj) });
    this.empresasFiltradas = empresasLista;
  }

  private carregarTodasUfs() {
    this.dominioService.obterPorTipo('UF_DETRAN').subscribe(response => {
      let ufs: Detran[] = [];

      if (response.valorDominio) {
        response.valorDominio.forEach(d => {
          ufs.push(<Detran>{
            ufDetran: d.valor,
            id: d.id
          });

          this.detrans = ufs;
        })
      }

      this.formulario.get('uf').enable();
    })
  }
}
