import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { Documento } from 'src/app/modules/sistemas/core/models/documento.model';
import { DadosInconsistenciasContrato } from 'src/app/modules/sistemas/sub-modules/admin/core/models/_portal/inconsistencias-contrato/dados-inconsistencias-contrato.model';
import { ContratoService } from 'src/app/modules/sistemas/sub-modules/admin/services/_portal/contrato.service';

@Component({
  selector: 'app-visualizar-inconsistencias-terceiro-garantidor',
  templateUrl: './terceiro-garantidor.component.html',
  styleUrls: ['./terceiro-garantidor.component.scss']
})
export class VisualizarInconsistenciasTerceiroGarantidorComponent implements OnInit {

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
      // this.contratoService.obterInconsistenciasContratoTerceiroGarantidor(this.protocolo).subscribe(response => {
      //   this.dadosInconsistenciasContrato = response.dadoInconsistenciaContrato;
      //   this.inconsistencia.emit(this.dadosInconsistenciasContrato.filter(inconsistencia => inconsistencia.possuiInconsistencia).length > 0);
      //   this.isLoading = false;
      // })
    }
  }

  formatarDados(dadoContrato: DadosInconsistenciasContrato) {
    if (Utility.isNullOrEmpty(dadoContrato.valor)) return "-";

    if (dadoContrato.propertyName == 'TerceiroGarantidor.Documento') {
      let documento: Documento = <Documento>{
        numero: dadoContrato.valor,
        tipoDocumento: this.dadosInconsistenciasContrato.filter(value => value.propertyName == 'TerceiroGarantidor.TipoDocumento')[0].valor == 'CPF' ? 1 : 0
      };

      return Utility.formatDocument(documento);
    }

    if (dadoContrato.propertyName == 'TerceiroGarantidor.Cep')
      return Utility.formatCep(this.dadosInconsistenciasContrato.filter(value => value.propertyName == 'TerceiroGarantidor.Cep')[0].valor)
    if (dadoContrato.propertyName == 'TerceiroGarantidor.Telefone')
      return `(${this.dadosInconsistenciasContrato.filter(value => value.propertyName == 'TerceiroGarantidor.DDD')[0].valor}) ${dadoContrato.valor}`
    return dadoContrato.valor;
  }

  showField(dadoContrato: DadosInconsistenciasContrato) {
    if (dadoContrato.propertyName == 'TerceiroGarantidor.CodigoMunicipio') return false
    if (dadoContrato.propertyName == 'TerceiroGarantidor.DDD') return false
    return true;
  }
}
