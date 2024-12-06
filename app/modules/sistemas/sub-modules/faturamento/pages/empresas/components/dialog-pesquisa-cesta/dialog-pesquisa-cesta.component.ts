import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Observable, map, startWith } from 'rxjs';
import { Utility } from 'src/app/core/common/utility';
import { TipoOperacao } from 'src/app/modules/sistemas/sub-modules/crm/core/enums/tipo-operacao.enum';
import { PrecoTbk } from '../../../../core/models/preco/preco-tbk.model';
import { TaxaDetran } from '../../../../core/models/taxa/taxa-detran.model';

@Component({
  selector: 'app-dialog-pesquisa-cesta',
  templateUrl: './dialog-pesquisa-cesta.component.html',
  styleUrls: ['./dialog-pesquisa-cesta.component.scss']
})
export class DialogPesquisaCestaComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data,
    private fb: FormBuilder) {
    this.listaPrecos = this.data.listaPrecos;
    this.taxaDetran = this.data.taxaDetran;
    this.consultaPreco = this.data.consultaPreco;
  }

  utility = Utility;

  listaPrecos: PrecoTbk[];
  taxaDetran: TaxaDetran;
  consultaPreco: boolean = false;

  formulario = this.fb.group({
    preco: [{ value: null }, Validators.required],
    periodoVigencia: [{ value: null }, Validators.required],
    dataInicioVigencia: [{ value: null }, Validators.required]
  });

  precoControl = new FormControl();
  options: string[] = []
  filteredOptions: Observable<string[]>;
  maxOptions: number = 10;

  resultadoPrecos: PrecoTbk[] = [];
  hoje = new Date();
  diasMesVigente = new Date().getDate();

  ngOnInit() {
    this.options = this.agruparPrecos(this.listaPrecos);
    this.hoje.setHours(0, 0, 0);

    this.filteredOptions = this.precoControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }

  ngAfterViewInit() {
    if (this.data.resultadoPrecos) {
      this.resultadoPrecos = [this.data.resultadoPrecos];
      this.formulario.get('preco').patchValue(this.resultadoPrecos[0].id)
    }
  }

  private _filter(value: string): string[] {
    if (value.length >= 3) {
      const filterValue = value?.toLowerCase();
      return this.options.filter(option => option.toLowerCase().includes(filterValue));
    }

    return this.options.filter(option => option.toLowerCase());
  }

  pesquisar() {
    this.resultadoPrecos = [];
    this.formulario.reset();

    let resultado = this.filtrarPrecos();

    if (resultado?.length > 0) {
      this.resultadoPrecos = resultado;
    }
  }

  retornarValorOperacao(preco: PrecoTbk, operacaoId: TipoOperacao) {
    return preco.operacoes?.filter(t => t.operacaoId === operacaoId)[0]?.valorTaxa;
  }

  retornarOperacaoAtivo(preco: PrecoTbk, operacaoId: TipoOperacao) {
    return preco.operacoes?.filter(t => t.operacaoId === operacaoId)[0]?.ativo || false;
  }

  retornarTaxaDetranOperacao(operacaoId: TipoOperacao) {
    return this.taxaDetran?.operacoes?.filter(o => o.operacaoId == operacaoId)[0]?.valorTaxa;
  }

  retornarTotalOperacao(preco: PrecoTbk, operacaoId: TipoOperacao) {
    let valorTaxa = this.taxaDetran?.operacoes?.filter(o => o.operacaoId == operacaoId)[0]?.valorTaxa || 0;
    return (+(valorTaxa + preco.operacoes?.filter(t => t.operacaoId === operacaoId)[0]?.valorTaxa)) || 0;
  }

  private filtrarPrecos(): PrecoTbk[] {
    return this.listaPrecos.filter(c => c.nome === this.precoControl.value);
  }

  private agruparPrecos(itens: PrecoTbk[]) {
    return [...new Set(itens.map(item => item.nome))];
  }
}
