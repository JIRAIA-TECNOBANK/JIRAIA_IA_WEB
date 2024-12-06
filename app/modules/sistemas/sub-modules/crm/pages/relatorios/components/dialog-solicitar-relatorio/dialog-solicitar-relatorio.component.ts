import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, UntypedFormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatLegacyAutocompleteTrigger as MatAutocompleteTrigger } from '@angular/material/legacy-autocomplete';
import { Subject, Subscription } from 'rxjs';
import { Utility } from 'src/app/core/common/utility';
import { ValorDominio } from 'src/app/modules/sistemas/sub-modules/admin/core/models/_portal/dominios/valor-dominio.model';
import { DominioResponse } from 'src/app/modules/sistemas/sub-modules/admin/core/responses/_portal/dominios/dominio.response';
import { PortalDominioService } from 'src/app/modules/sistemas/sub-modules/admin/services/_portal/portal-dominio.service';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';
import { Empresas } from '../../../../core/models/empresas/empresas.model';
import { EmpresasService } from '../../../../services/empresas.service';
import { Empresa } from '../../core/models/relatorios/empresa.model';
import { SolicitarRelatorioRequest } from '../../core/requests/solicitar-relatorio.request';

@Component({
  selector: 'app-dialog-solicitar-relatorio',
  templateUrl: './dialog-solicitar-relatorio.component.html',
  styleUrls: ['./dialog-solicitar-relatorio.component.scss'],
})
export class DialogSolicitarRelatorioComponent implements OnInit {

  utility = Utility;

  @ViewChild('autoCompleteInput', { read: MatAutocompleteTrigger })
  autoComplete: MatAutocompleteTrigger;
  constructor(private dialogService: DialogCustomService, private fb: UntypedFormBuilder, private dominioService: PortalDominioService, private empresaService: EmpresasService) { }

  formulario: FormGroup = this.fb.group({
    empresaNome: [null],
    modeloRelatorio: [{ value: '' }, Validators.required],
    formatoRelatorio: [null, Validators.required],
    periodo: [{ value: '' }, Validators.required],
    dataInicial: [{ value: '', disabled: true }, Validators.required],
    dataFinal: [{ value: '', disabled: true }, Validators.required],
    empresas: this.fb.array([], this.minLengthValidator()),
  });

  dataInicial;
  dataFinal;
  modelos: ValorDominio[] = [];

  empresasSelecionadas: Empresas[] = [];
  empresasFiltradas: Empresas[] = [];
  empresasRetorno: Empresas[] = [];
  empresaObrigatoriaSelecao: boolean = true;

  searchTerms = new Subject<string>();
  subscription: Subscription;

  // booleans
  isFocused: boolean = false;

  ngOnInit(): void {
    this.dialogService.setDialogData('nodata');
    this.carregarModelos();
    this.onPeriodoChange();

    this.formulario.get('dataInicial').valueChanges.subscribe((value) => {
      if (value) {
        this.dataInicial = value;
      }
    });

    this.formulario.get('dataFinal').valueChanges.subscribe((value) => {
      if (value) {
        this.dataFinal = value;
      }
    });

    this.formulario.get('periodo').valueChanges.subscribe((value) => {
      if (value == 1) {
        this.dataInicial = this.daysPrior(1);
      } else if (value == 2) {
        this.dataInicial = this.daysPrior(15);
      }
      this.dataFinal = new Date();
    });

    this.formulario.get('modeloRelatorio').valueChanges.subscribe(modelo => {
      this.carregarEmpresas(null, modelo);
      this.limparEmpresas();

      if (modelo) {
        this.formulario.get('empresaNome').enable();
        this.empresaObrigatoriaSelecao = this.empresaObrigatoria(modelo);
        return;
      }

      this.formulario.get('empresaNome').disable();
    })

    this.formulario.valueChanges.subscribe((value) => {
      if (this.formulario.valid) {
        let nome = this.modelos.filter((m) => m.id == value.modeloRelatorio)[0].valor;
        if (this.dataFinal && this.dataInicial) {
          let todasEmpresas = this.formulario.get('empresaNome').value == 'Todas as empresas';

          const empresasSelecionadas = this.empresasSelecionadas.map((num) => {
            const empresa = new Empresa();
            empresa.id = num.id;
            empresa.nome = num.nomeFantasia;
            return empresa;
          });

          let solicitacao = <SolicitarRelatorioRequest>{
            nome: nome,
            dominioId: this.formulario.get('modeloRelatorio').value,
            tipoArquivo: this.formulario.get('formatoRelatorio').value,
            periodo: this.formulario.get('periodo').value,
            dataInicial: new Date(this.dataInicial).toISOString(),
            dataFinal: new Date(this.dataFinal).toISOString(),
            empresas: empresasSelecionadas,
            todas: todasEmpresas
          };

          this.dialogService.setDialogData(solicitacao);
        }
      } else {
        this.dialogService.setDialogData('nodata');
      }
    });
  }

  selecionarTodas() {
    this.empresas.clear();

    let empresa = <Empresa>{
      id: 0,
      nome: 'Todas empresas'
    }

    this.empresas.push(new FormControl(empresa));
  }

  getRelatorioName(id) {
    let relatorioName = this.modelos.filter((m) => m.id == id);
    return relatorioName[0].valor;
  }

  onPeriodoChange() {
    this.formulario.get('periodo').valueChanges.subscribe((value) => {
      if (value == 3) {
        this.formulario.get('dataInicial').enable();
        this.formulario.get('dataFinal').enable();
      } else {
        this.formulario.get('dataInicial').disable();
        this.formulario.get('dataFinal').disable();
      }
    });
  }

  onChangeSearch(event) {
    let search = event.target.value;
    search.length >= 3 && this.searchTerms.next(search);
    search.length === 0 && this.searchTerms.next(search);
  }

  private carregarModelos() {
    this.dominioService
      .obterPorTipo('SOLICITACAO_RELATORIO')
      .subscribe((response: DominioResponse) => {
        if (response.isSuccessful) {
          this.modelos = response.valorDominio;
          this.formulario.get('modeloRelatorio').setValue(this.modelos[0].id)
        }
      });
  }

  habilitarOpcaoTodasEmpresas() {
    let relatorioCustoId = this.modelos.filter(m => m.palavraChave === 'OPERACAO_REALIZADA_CUSTO')[0];

    return this.formulario.get('modeloRelatorio').value == relatorioCustoId?.id;
  }

  // Utility
  getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();

  addMonths = (input, months) => {
    if (input) {
      const date = input._d ? new Date(input._d) : new Date(input);;
      date.setDate(1);
      date.setMonth(date.getMonth() + months);
      date.setDate(
        Math.min(
          input._d ? input._d.getDate() : input.getDate(),
          this.getDaysInMonth(date.getFullYear(), date.getMonth() + 1)
        )
      );
      return date;
    }
  };

  daysPrior(days) {
    const input = new Date();
    let date = new Date();
    date.setDate(input.getDate() - days);
    this.formulario.get('dataFinal').setValue(input);
    this.formulario.get('dataInicial').setValue(date);
    return date;
  }

  carregarEmpresas(filtro: string = null, modeloId: number) {
    let palavraChave = this.modelos.filter(m => m.id == modeloId)[0].palavraChave;

    if (filtro) {
      if (filtro.length >= 3) {
        const valueInput = filtro.toLocaleLowerCase()

        this.empresaService.obterEmpresasFiltro(0, 10, valueInput, 'true', palavraChave).subscribe(response => {
          if (response.isSuccessful) {
            this.formatarEmpresas(response.empresas);
          }
        })
        return;
      }
    }

    this.empresaService.obterEmpresasFiltro(0, 10, '', 'true', palavraChave).subscribe(response => {
      if (response.isSuccessful) {
        this.formatarEmpresas(response.empresas);
      }
    });
  }

  private formatarEmpresas(empresas: Empresas[]) {
    let empresasLista = empresas;
    empresasLista.forEach(empresa => { empresa.cnpj = Utility.formatCnpj(empresa.cnpj) });
    this.empresasFiltradas = empresasLista;
    this.empresasRetorno = empresasLista;
  }

  empresaObrigatoria(modelo: number): boolean {
    if (!modelo) return true;

    let palavraChave = this.modelos?.filter(m => m.id == modelo)[0]?.palavraChave;

    if (!palavraChave) { return false; }

    if (palavraChave === 'RELATORIO_DR' || palavraChave === 'RELATORIO_DUDA') {
      Utility.changeFieldValidators(this.formulario, 'empresas', [Validators.nullValidator])
      return false;
    }

    Utility.changeFieldValidators(this.formulario, 'empresas', [this.minLengthValidator()])
    return true;
  }

  selecionarEmpresa(empresas: Empresas[]) {
    const resultadoSelecionadas = this.empresasRetorno.filter(empresa => !empresas.includes(empresa));

    this.formulario.get('empresaNome').reset();
    this.empresasFiltradas = resultadoSelecionadas

    this.verificarEmpresas(empresas);
    this.empresasFiltradas.sort((a, b) => b.id - a.id);
  }

  get empresas(): FormArray {
    return this.formulario.get('empresas') as FormArray;
  }

  verificarEmpresas(empresas: Empresas[]) {
    empresas.forEach(empresa => {
      const { id, nomeFantasia } = empresa;
      let indexNull = this.formulario.controls['empresas'].value.findIndex(item => item == null);
      if (indexNull !== -1) {
        this.empresas.removeAt(indexNull);
      }

      const empresaIdIndex = this.formulario.controls['empresas'].value?.findIndex(item => item?.id === id);
      if (empresaIdIndex !== -1) {
        this.empresas.removeAt(empresaIdIndex);
      } else {
        let empresa = <Empresa>{
          id: id,
          nome: nomeFantasia
        }
        this.empresas.push(new FormControl(empresa));
      }
    });
  }

  minLengthValidator(min: number = 1): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control && control instanceof FormArray && control.value.length < min) {
        return { minLength: { requiredLength: min, actualLength: control.value.length } };
      }
      return null;
    };
  }

  limparEmpresas() {
    this.formulario.get('empresaNome').reset();
    this.empresasFiltradas = this.empresasRetorno;
    this.empresasSelecionadas = [];
    this.empresasFiltradas.sort((a, b) => b.id - a.id);
    this.empresas.clear();
  }
}
