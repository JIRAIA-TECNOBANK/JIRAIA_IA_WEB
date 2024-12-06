import { Component, OnInit } from '@angular/core';
import { ConsultarContratoResponse } from '../../../../../../admin/core/responses/_portal/contrato/consultar-contrato.response';
import { ContratoService } from '../../../../../../admin/services/_portal/contrato.service';

@Component({
  selector: 'app-espelho-dados-nsa-protocolo',
  templateUrl: './espelho-dados-nsa-protocolo.component.html',
  styleUrls: ['./espelho-dados-nsa-protocolo.component.scss']
})
export class EspelhoDadosNsaProtocoloComponent implements OnInit {

  contrato: ConsultarContratoResponse;

  constructor(private contratoService : ContratoService) { }

  ngOnInit(): void {
    this.contratoService.contrato$.subscribe(contrato => {
      this.contrato = contrato
    });
  }

}
