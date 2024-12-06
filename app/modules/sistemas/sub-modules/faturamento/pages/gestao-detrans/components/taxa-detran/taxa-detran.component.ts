import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { BlocoVazio } from 'src/app/modules/sistemas/core/models/common/bloco-vazio.model';
import { TransacaoFaturamento } from 'src/app/modules/sistemas/sub-modules/admin/core/models/_portal/transacoes/transacao-faturamento.model';
import { TransacaoService } from 'src/app/modules/sistemas/sub-modules/admin/services/_portal/transacao.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { TaxaDetran } from '../../../../core/models/taxa/taxa-detran.model';
import { TaxaService } from '../../../../services/taxa.service';

@Component({
  selector: 'app-taxa-detran',
  templateUrl: './taxa-detran.component.html',
  styleUrls: ['./taxa-detran.component.scss']
})
export class TaxaDetranComponent {

  utility = Utility;
  Permissoes = Permissoes;

  constructor(private notifierService: NotifierService,
    private taxaService: TaxaService,
    private store: Store<{ preloader: IPreloaderState }>,
    private transacaoService: TransacaoService) { }

  @Input('uf') uf: string = null;
  @Output('transacoesElegiveis') transacoesElegiveisFaturamento: EventEmitter<TransacaoFaturamento[]> = new EventEmitter<TransacaoFaturamento[]>();
  @Output('taxaVigenteOuProxima') taxaVigenteOuProxima: EventEmitter<TaxaDetran> = new EventEmitter<TaxaDetran>();
  @Output('continuar') continuar: EventEmitter<boolean> = new EventEmitter<boolean>();

  blocoVazio: BlocoVazio = {
    id: 'taxa-detran',
    icone: './../../../../assets/img/custom-icons/icon-vazio-artigos.svg',
    subtitulo: `Nenhuma taxa DETRAN foi adicionada ainda.`,
    mensagem: ''
  };

  criarTaxaDetran: boolean = false;
  listaTaxasDetran: TaxaDetran[] = [];
  editarTaxaDetran: TaxaDetran;

  transacoesElegiveis: TransacaoFaturamento[] = [];

  ngOnInit() {
    this.carregarTaxasDetran();
    this.obterFlagsElegiveisPorEstado();
  }

  verificarValidadeFormulario() {
    return this.listaTaxasDetran?.length > 0;
  }

  fecharCriarTaxa() {
    this.criarTaxaDetran = false;
    this.editarTaxaDetran = null;
    //atualizar lista de taxas
    this.carregarTaxasDetran();
  }

  onClickContinuar() {
    this.continuar.emit(true);
  }

  editarTaxa(taxa: TaxaDetran) {
    this.editarTaxaDetran = taxa;
    this.criarTaxaDetran = true;
  }

  cancelar() {
    this.criarTaxaDetran = false;
    this.editarTaxaDetran = null;
  }

  carregarTaxasDetran() {
    this.store.dispatch(showPreloader({ payload: '' }));

    this.listaTaxasDetran = [];
    this.taxaService.obterTaxasDetranPorUf(this.uf).subscribe(response => {
      this.listaTaxasDetran = response.taxasDetran.filter(t => t.ativo);
      this.carregarTaxaVigenteOuMaisProxima(this.listaTaxasDetran);
      this.store.dispatch(closePreloader());
    });
  }

  addNovaTaxa() {
    if (!Utility.getPermission([Permissoes.GESTAO_FINANCEIRO_PRECO_CADASTRAR, Permissoes.GESTAO_FINANCEIRO_APROVACAO_PRECO_TECNOBANK])) return;
    this.criarTaxaDetran = true
  }

  private carregarTaxaVigenteOuMaisProxima(taxasDetran: TaxaDetran[]) {
    let taxaDetran = taxasDetran.sort((b, a) => new Date(b.dataInicioVigencia).getTime() - new Date(a.dataInicioVigencia).getTime());
    let taxaVigenteOuProxima = taxaDetran[0];

    if (taxaVigenteOuProxima) {
      this.taxaVigenteOuProxima.emit(taxaVigenteOuProxima);
    }
  }

  private obterFlagsElegiveisPorEstado() {
    this.transacaoService.obterFlagsElegiveisFaturamento([this.uf]).subscribe(response => {
      if (response.isSuccessful) {
        this.transacoesElegiveis = response.transacaoFaturamento;
        this.transacoesElegiveisFaturamento.emit(this.transacoesElegiveis);
      }
    })
  }


}
