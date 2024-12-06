import { Component, OnInit } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { ConsultarContratoResponse } from '../../../../../../admin/core/responses/_portal/contrato/consultar-contrato.response';
import { ContratoService } from '../../../../../../admin/services/_portal/contrato.service';

@Component({
  selector: 'app-espelho-dados-complementares',
  templateUrl: './espelho-dados-complementares.component.html',
  styleUrls: ['./espelho-dados-complementares.component.scss']
})
export class EspelhoDadosComplementaresComponent implements OnInit {

  contrato: ConsultarContratoResponse;
  documentoRecebedor: string = "-"
  documentoVendedor: string = "-"
  valorTaxaIof: string = '-'

  constructor(private contratoService: ContratoService) { }

  ngOnInit(): void {
    this.contratoService.contrato$.subscribe(contrato => {
      if (contrato != undefined) {
        this.contrato = contrato;
        this.valorTaxaIof = Utility.formatCurrencyValue(+this.contrato?.complementar?.taxaIof) ?? '-'

        if (!Utility.isNullOrEmpty(this.contrato.complementar.documentoRecebedor?.numero)) {
          this.documentoRecebedor = Utility.formatDocument(this.contrato.complementar.documentoRecebedor);
        }
        if (!Utility.isNullOrEmpty(this.contrato.complementar.documentoVendedor?.numero)) {
          this.documentoVendedor = Utility.formatDocument(this.contrato.complementar.documentoVendedor);
        }
      }
      else this.contrato = new ConsultarContratoResponse();
    });
  }

  getValorTaxaContrato(taxaContrato) {
    if (taxaContrato === null) return '-';
    if (this.contrato.contrato?.ufLicenciamento == 'PR') {
      return Utility.formatCurrencyValue(taxaContrato);
    }
    return taxaContrato + '%'
  }

}
