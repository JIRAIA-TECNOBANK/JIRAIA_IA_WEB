import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Utility } from 'src/app/core/common/utility';
import { Municipio } from '../../../../../core/models/geograficos/municipio.model';
import { MunicipioResponse } from '../../../../../core/responses/geograficos/municipio.response';
import { GeograficoService } from '../../../../../services/geografico.service';
import { DadosInconsistenciasContrato } from '../../../../../../admin/core/models/_portal/inconsistencias-contrato/dados-inconsistencias-contrato.model';
import { ContratoService } from '../../../../../../admin/services/_portal/contrato.service';

@Component({
  selector: 'app-visualizar-inconsistencias-dados-financiamento',
  templateUrl: './dados-financiamento.component.html',
  styleUrls: ['./dados-financiamento.component.scss']
})
export class VisualizarInconsistenciasDadosFinanciamentoComponent implements OnInit {

  
  constructor(private contratoService: ContratoService,
    private geograficoService: GeograficoService) { }

  @Input('protocolo') protocolo: string;
  @Output() inconsistencia: EventEmitter<boolean> = new EventEmitter<boolean>();

  dadosInconsistenciasContrato: DadosInconsistenciasContrato[] = [];
  isLoading: boolean = true;
  municipio: string = "-"

  ngOnInit(): void {
    this.carregaDados();
  }

  carregaDados() {
    if (this.protocolo != undefined) {
      this.contratoService.obterInconsistenciasContratoFinanciamento(this.protocolo).subscribe(response => {
        this.dadosInconsistenciasContrato = response.dadoInconsistenciaContrato;
        this.inconsistencia.emit(this.dadosInconsistenciasContrato.filter(inconsistencia => inconsistencia.possuiInconsistencia).length > 0);
        this.isLoading = false;
      })
    }
  }

  formatarDados(dadoContrato: DadosInconsistenciasContrato) {
    if (Utility.isNullOrEmpty(dadoContrato.valor)) return "-";

    if (dadoContrato.propertyName == 'Financiamento.ValorTotalDivida' || dadoContrato.propertyName == 'Financiamento.ValorParcela') { return Utility.formatCurrencyValue(+dadoContrato.valor.replace(',', '.')); }
    if (dadoContrato.propertyName == 'Financiamento.Municipio') { return this.municipio; }
    return dadoContrato.valor;
  }

  private filtrarMunicipio(uf: string, idMunicipio: number) {
    if (uf != undefined) {
      this.geograficoService.obterMunicipiosPorUf(uf)
        .subscribe((municipios: MunicipioResponse) => {
          this.municipio = municipios.municipios.filter((item: Municipio) => { return item.id == idMunicipio })[0].nome;
        })
    }
  }
}
