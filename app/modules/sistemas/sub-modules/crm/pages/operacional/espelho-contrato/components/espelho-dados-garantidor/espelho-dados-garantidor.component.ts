import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-espelho-dados-garantidor',
  templateUrl: './espelho-dados-garantidor.component.html',
  styleUrls: ['./espelho-dados-garantidor.component.scss']
})
export class EspelhoDadosGarantidorComponent implements OnInit {

  contrato = {
    terceiroGarantidor: {
      nomeDoTerceiroGarantidor: null,
      documento: { numero: null, tipoDocumento: null },
      endereco: { logradouro: null, cep: null, complemento: null, uf: null, numero: null, bairro: null, municipio: null },
      contato: { ddd: null, telefone: null }
    }
  };

  constructor() {
    //
  }

  ngOnInit(): void {
    //
  }

}
