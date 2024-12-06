import { registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';
import { Component, Input, LOCALE_ID } from '@angular/core';
import { TipoOperacao } from 'src/app/modules/sistemas/sub-modules/crm/core/enums/tipo-operacao.enum';
import { PrecoTbk } from '../../../../core/models/preco/preco-tbk.model';
import { TaxaDetran } from '../../../../core/models/taxa/taxa-detran.model';

registerLocaleData(ptBr);

@Component({
  selector: 'app-tabela-listagem-precos',
  templateUrl: './tabela-listagem-precos.component.html',
  styleUrls: ['./tabela-listagem-precos.component.scss'],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt' },
  ],
})
export class TabelaListagemPrecosComponent {

  @Input('taxaDetran') taxaDetran: TaxaDetran;
  @Input('preco') preco: PrecoTbk;

  retornarTaxaDetranOperacao(operacaoId: TipoOperacao) {
    return this.taxaDetran?.operacoes?.filter(o => o.operacaoId == operacaoId)[0]?.valorTaxa;
  }

  retornarOperacaoAtivo(preco: PrecoTbk, operacaoId: TipoOperacao) {
    return preco.operacoes?.filter(t => t.operacaoId === operacaoId)[0]?.ativo || false;
  }
  
  retornarValorOperacao(preco: PrecoTbk, operacaoId: TipoOperacao) {
    return preco.operacoes?.filter(t => t.operacaoId === operacaoId)[0]?.valorTaxa;
  }

  retornarTotalOperacao(preco: PrecoTbk, operacaoId: TipoOperacao) {
    let valorTaxa = this.taxaDetran?.operacoes?.filter(o => o.operacaoId == operacaoId)[0]?.valorTaxa || 0;
    return (+(valorTaxa + preco.operacoes?.filter(t => t.operacaoId === operacaoId)[0]?.valorTaxa)) || 0;
  }
}
