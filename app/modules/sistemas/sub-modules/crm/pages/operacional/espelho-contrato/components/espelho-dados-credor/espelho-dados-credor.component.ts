import { Component, OnInit } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { ConsultarContratoResponse } from '../../../../../../admin/core/responses/_portal/contrato/consultar-contrato.response';
import { ContratoService } from '../../../../../../admin/services/_portal/contrato.service';

@Component({
  selector: 'app-espelho-dados-credor',
  templateUrl: './espelho-dados-credor.component.html',
  styleUrls: ['./espelho-dados-credor.component.scss']
})
export class EspelhoDadosCredorComponent implements OnInit {

  constructor(private contratoService: ContratoService) { }

  contrato: ConsultarContratoResponse;
  agenteFinanceiro: string = "-"
  credorDocumento: string = "-"
  credorCep: string = "-"

  ngOnInit(): void {
    this.contratoService.contrato$.subscribe(contrato => {
      if (contrato != undefined) {
        this.contrato = contrato;

        if (this.contrato.credor.documento?.tipoDocumento !== null) { this.credorDocumento = Utility.formatDocument(this.contrato.credor.documento); }
        if (this.contrato.credor?.endereco?.cep !== null) { this.credorCep = Utility.formatCep(this.contrato.credor?.endereco?.cep); }
      }
      else this.contrato = new ConsultarContratoResponse();
    });
  }

}
