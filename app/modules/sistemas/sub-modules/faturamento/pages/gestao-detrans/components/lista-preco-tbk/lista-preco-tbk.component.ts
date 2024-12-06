import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Store } from '@ngrx/store';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { TipoOperacao } from '../../../../../crm/core/enums/tipo-operacao.enum';
import { PrecoTbk } from '../../../../core/models/preco/preco-tbk.model';
import { TaxaDetran } from '../../../../core/models/taxa/taxa-detran.model';
import { PrecoService } from '../../../../services/preco.service';

@Component({
  selector: 'app-lista-preco-tbk',
  templateUrl: './lista-preco-tbk.component.html',
  styleUrls: ['./lista-preco-tbk.component.scss'],
})
export class ListaPrecoTbkComponent {

  utility = Utility;
  permissoes = Permissoes

  @Input('listaPrecoTbk') listaPrecoTbk: PrecoTbk[];
  @Input('taxaDetran') taxaDetran: TaxaDetran;
  @Input('consulta') consulta: boolean;
  @Output('resumoPreco') resumoPreco: EventEmitter<PrecoTbk> = new EventEmitter<PrecoTbk>();
  @Output('excluirPrecoTbk') excluirPrecoTbk: EventEmitter<boolean> = new EventEmitter<boolean>();

  panelOpenState = false;

  constructor(private notifierService: NotifierService,
    private precoService: PrecoService,
    private store: Store<{ preloader: IPreloaderState }>) { }

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

  editarPreco(preco: PrecoTbk) {
    this.resumoPreco.emit(preco);
  }

  excluirPreco(id: number, tipoPreco: number) {
    this.store.dispatch(showPreloader({ payload: '' }));

    this.precoService.excluirPrecoTbk(id).subscribe(response => {
      if (response.precoTecnobankId) {
        let tipoPrecoNome = tipoPreco === 1 ? 'público' : 'privado';
        this.notifierService.showNotification(`Preço TBK ${tipoPrecoNome} agendado excluído com sucesso!`, '', 'success');
        this.excluirPrecoTbk.emit(true);
      }
      else {
        this.notifierService.showNotification(response.errors[0].message, '', 'error');
      }
      this.store.dispatch(closePreloader());
    });
  }

  mostrarIconesEdicaoExclusao(preco: PrecoTbk) {
    if (preco.tipoPreco == 1) {
      return true;
    }

    return preco.permiteExclusao;
  }

  mostrarIconeExclusao(preco: PrecoTbk) {
    if (preco.tipoPreco == 1) {
      return preco.status !== 'VIGENTE' && Utility.getPermission([Permissoes.GESTAO_FINANCEIRO_PRECO_CADASTRAR]);
    }

    return preco.permiteExclusao;
  }
}
