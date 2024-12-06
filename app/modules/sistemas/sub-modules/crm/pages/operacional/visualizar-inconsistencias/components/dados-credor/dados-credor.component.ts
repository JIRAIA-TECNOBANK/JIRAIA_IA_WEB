import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Utility } from 'src/app/core/common/utility';
import { Documento } from 'src/app/modules/sistemas/core/models/documento.model';
import { DadosInconsistenciasContrato } from '../../../../../../admin/core/models/_portal/inconsistencias-contrato/dados-inconsistencias-contrato.model';
import { ContratoService } from '../../../../../../admin/services/_portal/contrato.service';

@Component({
  selector: 'app-visualizar-inconsistencias-dados-credor',
  templateUrl: './dados-credor.component.html',
  styleUrls: ['./dados-credor.component.scss']
})
export class VisualizarInconsistenciasDadosCredorComponent implements OnInit {

  constructor(private contratoService: ContratoService) { }

  @Input('protocolo') protocolo: string;
  @Output() inconsistencia: EventEmitter<boolean> = new EventEmitter<boolean>();

  dadosInconsistenciasContrato: DadosInconsistenciasContrato[] = [];
  isLoading: boolean = true;

  ngOnInit(): void {
    this.carregaDados();
  }

  carregaDados() {
    if (this.protocolo != undefined) {
      this.contratoService.obterInconsistenciasContratoCredor(this.protocolo).subscribe(response => {
        this.dadosInconsistenciasContrato = response.dadoInconsistenciaContrato;
        this.inconsistencia.emit(this.dadosInconsistenciasContrato.filter(inconsistencia => inconsistencia.possuiInconsistencia).length > 0);
        this.isLoading = false;
      })
    }
  }

  formatarDados(dadoContrato: DadosInconsistenciasContrato) {
    if (Utility.isNullOrEmpty(dadoContrato.valor)) return "-";

    if (dadoContrato.propertyName == 'Credor.Documento') {
      let documento: Documento = <Documento>{
        numero: dadoContrato.valor,
        tipoDocumento: 0
      };

      return Utility.formatDocument(documento);
    }

    if (dadoContrato.propertyName == 'Credor.Cep') { return Utility.formatCep(this.dadosInconsistenciasContrato.filter(value => value.propertyName == 'Credor.Cep')[0].valor); }
    if (dadoContrato.propertyName == 'Credor.Telefone') { return '(' + this.dadosInconsistenciasContrato.filter(value => value.propertyName == 'Credor.DDD')[0].valor + ') ' + dadoContrato.valor; }
    return dadoContrato.valor;
  }


}
