import { Component, OnInit } from '@angular/core';
import { ConsultarContratoResponse } from '../../../../../../admin/core/responses/_portal/contrato/consultar-contrato.response';
import { ContratoService } from '../../../../../../admin/services/_portal/contrato.service';

@Component({
  selector: 'app-espelho-adm-consorcios',
  templateUrl: './espelho-adm-consorcios.component.html',
  styleUrls: ['./espelho-adm-consorcios.component.scss']
})
export class EspelhoAdmConsorciosComponent implements OnInit {

  contrato: ConsultarContratoResponse;

  constructor(private contratoService : ContratoService) { }

  ngOnInit(): void {
    this.contratoService.contrato$.subscribe(contrato => {
      this.contrato = contrato
    });
  }
}
