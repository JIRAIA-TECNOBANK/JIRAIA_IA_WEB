import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Utility } from 'src/app/core/common/utility';
import { Documento } from 'src/app/modules/sistemas/core/models/documento.model';
import { DadosInconsistenciasContrato } from '../../../../../../admin/core/models/_portal/inconsistencias-contrato/dados-inconsistencias-contrato.model';
import { ContratoService } from '../../../../../../admin/services/_portal/contrato.service';

@Component({
  selector: 'app-visualizar-inconsistencias-dados-complementar',
  templateUrl: './dados-complementar.component.html',
  styleUrls: ['./dados-complementar.component.scss']
})
export class VisualizarInconsistenciasDadosComplementarComponent implements OnInit {
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
      this.contratoService.obterInconsistenciasContratoComplementar(this.protocolo).subscribe(response => {
        this.dadosInconsistenciasContrato = response.dadoInconsistenciaContrato;
        this.inconsistencia.emit(this.dadosInconsistenciasContrato.filter(inconsistencia => inconsistencia.possuiInconsistencia).length > 0);
        this.isLoading = false;
      })
    }
  }

  formatarDados(dadoContrato: DadosInconsistenciasContrato) {
    if (Utility.isNullOrEmpty(dadoContrato.valor)) return "-";

    if (dadoContrato.propertyName == 'Complementar.TaxaContrato'
      || dadoContrato.propertyName == 'Complementar.TaxaIof'
      || dadoContrato.propertyName == 'Complementar.ValorTaxaMora'
      || dadoContrato.propertyName == 'Complementar.ValorTaxaMulta'
      || dadoContrato.propertyName == 'Complementar.TaxaJurosMes'
      || dadoContrato.propertyName == 'Complementar.TaxaJurosAno'
      || dadoContrato.propertyName == 'Complementar.Comissao') {
      return +dadoContrato.valor.replace(',', '.') + '%'
    }

    if (dadoContrato.propertyName == 'Complementar.DocumentoRecebedor' || dadoContrato.propertyName == 'Complementar.DocumentoVendedor') {
      if (dadoContrato.valor !== "") {
        let propertyName = dadoContrato.propertyName == 'Complementar.DocumentoRecebedor' ? 'Complementar.TipoDocumentoRecebedor' : 'Complementar.TipoDocumentoVendedor'
        let documento: Documento = <Documento>{
          numero: dadoContrato.valor,
          tipoDocumento: this.dadosInconsistenciasContrato.filter(value => value.propertyName == propertyName)[0].valor == 'CPF' ? 1 : 0
        };

        return Utility.formatDocument(documento);
      }
    }

    if (dadoContrato.propertyName == 'Complementar.TipoDocumentoRecebedor' || dadoContrato.propertyName == 'Complementar.TipoDocumentoVendedor') {
      let propertyName = dadoContrato.propertyName == 'Complementar.TipoDocumentoRecebedor' ? 'Complementar.DocumentoRecebedor' : 'Complementar.DocumentoVendedor'
      if (this.dadosInconsistenciasContrato.filter(value => value.propertyName == propertyName)[0].valor == "" || this.dadosInconsistenciasContrato.filter(value => value.propertyName == propertyName)[0].valor == "-") dadoContrato.valor = "";
    }

    return dadoContrato.valor;
  }

  showField(dadoContrato: DadosInconsistenciasContrato) {
    if (dadoContrato.propertyName == 'Complementar.ValorTaxaMora') {
      return this.dadosInconsistenciasContrato.filter(value => value.propertyName == 'Complementar.IndicadorTaxaMora')[0].valor !== 'NÃO';
    }

    if (dadoContrato.propertyName == 'Complementar.ValorTaxaMulta') {
      return this.dadosInconsistenciasContrato.filter(value => value.propertyName == 'Complementar.IndicadorTaxaMulta')[0].valor !== 'NÃO';
    }

    if (dadoContrato.propertyName == 'Complementar.TipoDocumentoRecebedor') {
      return this.dadosInconsistenciasContrato.filter(value => value.propertyName == 'Complementar.DocumentoVendedor')[0] !== undefined;
    }

    if (dadoContrato.propertyName == 'Complementar.TipoDocumentoVendedor') {
      return this.dadosInconsistenciasContrato.filter(value => value.propertyName == 'Complementar.DocumentoVendedor')[0] !== undefined;
    }

    return true;
  }
}
