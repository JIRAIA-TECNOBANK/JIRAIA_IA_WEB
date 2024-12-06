import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { TransacaoFaturamento } from 'src/app/modules/sistemas/sub-modules/admin/core/models/_portal/transacoes/transacao-faturamento.model';
import { TaxaDetran } from 'src/app/modules/sistemas/sub-modules/faturamento/core/models/taxa/taxa-detran.model';

@Component({
  selector: 'app-stepper-parametrizar-detran',
  templateUrl: './stepper-parametrizar-detran.component.html',
  styleUrls: ['./stepper-parametrizar-detran.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
})
export class StepperParametrizarDetranComponent {

  @ViewChild(MatStepper) stepper: MatStepper;

  etapaAtual: number = 0;
  uf: string = null;

  transacoesElegiveis: TransacaoFaturamento[] = [];
  taxaVigenteOuProxima: TaxaDetran;

  blocoInformacoes = {
    dadosDetran: {
      id: 'dados-detran',
      descricao:
        'Encontre aqui todas as informações básicas referentes a este DETRAN.'
    },
    taxaDetran: {
      id: 'taxa-detran',
      descricao:
        'O valor da taxa DETRAN será reajustado conforme determinação em portaria expedida pelo próprio órgão.'
    },
    precoDetran: {
      id: 'preco-detran',
      descricao:
        `O valor do <strong>preço público</strong> deve ser cadastrado seguindo a determinação da portaria expedida pelo próprio órgão. <br>
        <br>
        A Tecnobank poderá cobrar do cliente a soma da taxa DETRAN acrescida do preço TBK, por operação ou somente o preço TBK, a depender do acordo comercial.<br>
        <br>
        Nos casos em que a portaria permita a cobrança do <strong>preço privado</strong>, poderá ser cobrado do cliente a soma do preço privado acrescida da Taxa DETRAN ou somente o preço privado, conforme acordo comercial.<br>
        <br>
        O preço privado poderá ser parametrizado por cliente e seu cadastro deve ser realizado no cadastro da empresa, na tela configuração de produto.`
    }
  };

  alterarAba(event) {
    this.etapaAtual = event.selectedIndex;
  }

  navegarParaEtapa(etapa: number) {
    this.etapaAtual = etapa;
    this.stepper.selectedIndex = etapa;
  }

  carregarTransacoesElegiveis(event: TransacaoFaturamento[]) {
    this.transacoesElegiveis = event;
  }

  carregarTaxaDetran(event: TaxaDetran) {
    this.taxaVigenteOuProxima = event;
  }

}
