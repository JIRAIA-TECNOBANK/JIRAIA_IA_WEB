import { Component, OnInit } from '@angular/core';
import { Especie } from '../../../../../core/models/veiculos/especie.model';
import { Veiculo } from '../../../../../../admin/core/models/_portal/contratos/veiculo.model';
import { ConsultarContratoResponse } from '../../../../../../admin/core/responses/_portal/contrato/consultar-contrato.response';
import { ObterEspeciesResponse } from '../../../../../../admin/core/responses/_portal/veiculos/obter-especies.response';
import { ContratoService } from '../../../../../../admin/services/_portal/contrato.service';
import { VeiculoService } from '../../../../../../admin/services/_portal/veiculo.service';

@Component({
  selector: 'app-espelho-dados-veiculo',
  templateUrl: './espelho-dados-veiculo.component.html',
  styleUrls: ['./espelho-dados-veiculo.component.scss']
})
export class EspelhoDadosVeiculoComponent implements OnInit {

  constructor(
    private veiculoService: VeiculoService,
    private contratoService: ContratoService) { }

  contrato: ConsultarContratoResponse;
  especiesVeiculo: Especie[];
  veiculos: Veiculo[];

  ngOnInit(): void {
    this.contratoService.contrato$.subscribe(contrato => {
      if (contrato != undefined) {
        this.contrato = contrato;
        this.veiculos = this.contrato.veiculo.filter(v => v.chassi);
        this.carregarEspecies();
      }
      else this.contrato = new ConsultarContratoResponse();
    });
  }

  carregarEspecies() {
    this.veiculoService.obterEspecies()
      .subscribe((response: ObterEspeciesResponse) => {
        if (response.especies) {
          this.especiesVeiculo = response.especies;
        }
      });
  }

  getEspecieVeiculo(especieId: number): string {
    var especieVeiculo = this.especiesVeiculo?.filter(especie => especie.id == especieId)[0];
    return especieVeiculo ? especieVeiculo.nome : '-';
  }
}
