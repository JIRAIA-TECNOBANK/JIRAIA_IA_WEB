import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { BlocoVazio } from 'src/app/modules/sistemas/core/models/common/bloco-vazio.model';
import { TransacaoFaturamento } from 'src/app/modules/sistemas/sub-modules/admin/core/models/_portal/transacoes/transacao-faturamento.model';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { PrecoTbk } from '../../../../core/models/preco/preco-tbk.model';
import { TaxaDetran } from '../../../../core/models/taxa/taxa-detran.model';
import { PrecoService } from '../../../../services/preco.service';

@Component({
  selector: 'app-preco-tbk',
  templateUrl: './preco-tbk.component.html',
  styleUrls: ['./preco-tbk.component.scss']
})
export class PrecoTbkComponent implements OnInit {

  utility = Utility;
  permissoes = Permissoes;

  constructor(private precoService: PrecoService,
    private store: Store<{ preloader: IPreloaderState }>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private notifierService: NotifierService) { }

  @Input('uf') uf: string = null;
  @Input('transacoesElegiveis') transacoesElegiveis: TransacaoFaturamento[];
  @Input('taxaDetran') taxaDetran: TaxaDetran;
  @Input('consulta') consulta: boolean;
  @Input('tipoPreco') tipoPreco: number = null;
  @Input('cadastroEmpresa') cadastroEmpresa: boolean = false;

  @Output('cancelar') clickClancelar: EventEmitter<boolean> = new EventEmitter<boolean>();

  blocoVazio: BlocoVazio = {
    id: 'preco-tbk',
    icone: './../../../../assets/img/custom-icons/icon-vazio-artigos.svg',
    subtitulo: `Nenhum preço TBK foi adicionado ainda.`,
    mensagem: ''
  };

  criarPrecoDetran: boolean = false;
  listaPrecoTbk: PrecoTbk[] = [];
  editarPrecoTbk: PrecoTbk;

  ngOnInit() {
    this.carregarPrecoTbk();
  }

  cancelar() {
    this.criarPrecoDetran = false;
    this.editarPrecoTbk = null;
    this.clickClancelar.emit(true);
  }

  fecharCriarPreco() {
    this.criarPrecoDetran = false;
    this.editarPrecoTbk = null;
    //atualizar lista de taxas
    this.carregarPrecoTbk();
  }

  editarPreco(preco: PrecoTbk) {
    this.editarPrecoTbk = preco;
    this.criarPrecoDetran = true;
  }

  carregarPrecoTbk() {
    this.store.dispatch(showPreloader({ payload: '' }));

    this.listaPrecoTbk = [];

    this.precoService.obterPrecoTbkPorUf(this.uf, true, this.tipoPreco).subscribe(response => {
      this.listaPrecoTbk = response.precoTecnobank.filter(t => t.ativo);

      if (this.tipoPreco == 1) {
        this.listaPrecoTbk = this.listaPrecoTbk.sort((b, a) => new Date(b.dataInicioVigencia).getTime() - new Date(a.dataInicioVigencia).getTime());
      }

      this.store.dispatch(closePreloader());
    });
  }

  onClickContinuar() {
    this.router.navigate([`../../`], { relativeTo: this.activatedRoute });
  }
}
