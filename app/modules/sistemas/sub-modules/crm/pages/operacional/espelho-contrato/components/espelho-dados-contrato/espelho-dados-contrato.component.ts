import { Component, OnInit } from '@angular/core';
import { ValorDominio } from '../../../../../../admin/core/models/_portal/dominios/valor-dominio.model';
import { ConsultarContratoResponse } from '../../../../../../admin/core/responses/_portal/contrato/consultar-contrato.response';
import { DominioResponse } from '../../../../../../admin/core/responses/_portal/dominios/dominio.response';
import { ContratoService } from '../../../../../../admin/services/_portal/contrato.service';
import { PortalDominioService } from '../../../../../../admin/services/_portal/portal-dominio.service';

@Component({
  selector: 'app-espelho-dados-contrato',
  templateUrl: './espelho-dados-contrato.component.html',
  styleUrls: ['./espelho-dados-contrato.component.scss']
})
export class EspelhoDadosContratoComponent implements OnInit {

  contrato: ConsultarContratoResponse;
  tipoRestricao: string = "-";
  tipoAditivo: string = "-";
  gravame: string = "-";

  constructor(private contratoService: ContratoService,
    private dominioService: PortalDominioService
  ) { }

  ngOnInit(): void {

    this.contratoService.contrato$.subscribe(contrato => {
      if (contrato != undefined) {
        this.contrato = contrato;

        this.carregarTipoRestricao(contrato.contrato.tipoRestricao);

        if (contrato.contrato.tipoAditivo !== null) { this.carregarTipoAditivo(contrato.contrato.tipoAditivo); }
        else { this.tipoAditivo = "-"; }
      }
      else this.contrato = new ConsultarContratoResponse();
    });
  }

  private carregarTipoRestricao(tipoRestricaoId: number) {
    this.dominioService.obterPorTipo('TIPO_RESTRICAO')
      .subscribe((response: DominioResponse) => {

        if (response.isSuccessful) {
          response.valorDominio.forEach((dominio: ValorDominio) => {
            if (dominio.id == tipoRestricaoId) this.tipoRestricao = dominio.valor;
          })
        }
      })
  }

  private carregarTipoAditivo(tipoAditivoId: number) {
    this.dominioService.obterPorTipo('TIPO_ADITIVO')
      .subscribe((response: DominioResponse) => {

        if (response.isSuccessful) {
          response.valorDominio.forEach((dominio: ValorDominio) => {
            if (dominio.id == tipoAditivoId) this.tipoAditivo = dominio.valor;
          })
        }
      })
  }

}
