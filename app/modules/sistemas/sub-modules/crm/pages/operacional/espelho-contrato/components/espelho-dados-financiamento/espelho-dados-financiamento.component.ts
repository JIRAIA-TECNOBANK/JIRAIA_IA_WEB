import { Component, OnInit } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { Municipio } from '../../../../../core/models/geograficos/municipio.model';
import { MunicipioResponse } from '../../../../../core/responses/geograficos/municipio.response';
import { ConsultarContratoResponse } from '../../../../../../admin/core/responses/_portal/contrato/consultar-contrato.response';
import { ContratoService } from '../../../../../../admin/services/_portal/contrato.service';
import { PortalGeograficoService } from '../../../../../../admin/services/_portal/portal-geografico.service';

@Component({
  selector: 'app-espelho-dados-financiamento',
  templateUrl: './espelho-dados-financiamento.component.html',
  styleUrls: ['./espelho-dados-financiamento.component.scss']
})
export class EspelhoDadosFinanciamentoComponent implements OnInit {

  constructor(
    private contratoService: ContratoService,
    private geograficoService: PortalGeograficoService) { }


  contrato: ConsultarContratoResponse;
  municipio: string = "-"
  valorTotalDivida: string = '-'
  valorParcela: string = '-'

  ngOnInit(): void {
    this.contratoService.contrato$.subscribe(contrato => {
      if (contrato != undefined) {
        this.contrato = contrato;

        this.filtrarMunicipio(this.contrato?.financiamento.liberacaoCredito?.uf, contrato?.financiamento?.idMunicipio);
        this.valorTotalDivida = Utility.formatCurrencyValue(this.contrato?.financiamento?.valorTotalDivida) ?? '-'
        this.valorParcela = Utility.formatCurrencyValue(this.contrato?.financiamento?.valorParcela) ?? '-'
      }
      else this.contrato = new ConsultarContratoResponse();
    });
  }

  private filtrarMunicipio(uf: string, idMunicipio: number) {
    if (uf != undefined) {
      this.geograficoService.obterMunicipiosPorUf(uf)
        .subscribe((municipios: MunicipioResponse) => {
          this.municipio = municipios.municipios.filter((item: Municipio) => { return item.id == idMunicipio })[0]?.nome;
        })
    }
  }

}
