import { Component, EventEmitter, Input, LOCALE_ID, Output } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { TipoOperacao } from '../../../../../crm/core/enums/tipo-operacao.enum';

import { registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';
import { Store } from '@ngrx/store';
import { Permissoes } from 'src/app/core/common/permissoes';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { TaxaDetran } from '../../../../core/models/taxa/taxa-detran.model';
import { TaxaService } from '../../../../services/taxa.service';

registerLocaleData(ptBr);

@Component({
  selector: 'app-lista-taxa-detran',
  templateUrl: './lista-taxa-detran.component.html',
  styleUrls: ['./lista-taxa-detran.component.scss'],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt' },
  ],
})
export class ListaTaxaDetranComponent {

  utility = Utility;
  Permissoes = Permissoes;

  @Input('listaTaxaDetran') listaTaxaDetran: TaxaDetran[];
  @Output('resumoTaxa') resumoTaxa: EventEmitter<TaxaDetran> = new EventEmitter<TaxaDetran>();
  @Output('excluirTaxaDetran') excluirTaxaDetran: EventEmitter<boolean> = new EventEmitter<boolean>();

  panelOpenState = false;

  constructor(private notifierService: NotifierService,
    private taxaService: TaxaService,
    private store: Store<{ preloader: IPreloaderState }>) { }

  retornarValorOperacao(taxa: TaxaDetran, operacaoId: TipoOperacao) {
    return taxa.operacoes?.filter(t => t.operacaoId === operacaoId)[0]?.valorTaxa;
  }

  retornarOperacaoAtivo(taxa: TaxaDetran, operacaoId: TipoOperacao) {
    return taxa.operacoes?.filter(t => t.operacaoId === operacaoId)[0]?.ativo;
  }

  editarTaxa(taxa: TaxaDetran) {
    if (!Utility.getPermission([Permissoes.GESTAO_FINANCEIRO_PRECO_CADASTRAR, Permissoes.GESTAO_FINANCEIRO_APROVACAO_PRECO_TECNOBANK])) return;
    this.resumoTaxa.emit(taxa);
  }

  excluirTaxa(id: number) {
    if (!Utility.getPermission([Permissoes.GESTAO_FINANCEIRO_PRECO_CADASTRAR, Permissoes.GESTAO_FINANCEIRO_APROVACAO_PRECO_TECNOBANK])) return;

    this.store.dispatch(showPreloader({ payload: '' }));

    this.taxaService.excluirTaxaDetran(id).subscribe(response => {
      if (response.taxaDetranId) {
        this.notifierService.showNotification('Taxa DETRAN agendada excluída com sucesso!', '', 'success');
        this.excluirTaxaDetran.emit(true);
      }
      this.store.dispatch(closePreloader());
    });
  }
}
