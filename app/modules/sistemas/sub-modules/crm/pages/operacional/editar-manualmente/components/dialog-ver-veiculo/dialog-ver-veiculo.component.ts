import { Component, Inject, OnInit } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Veiculo } from '../../../../../../admin/core/models/_portal/contratos/veiculo.model';
import { Utility } from 'src/app/core/common/utility';

@Component({
  selector: 'app-dialog-ver-veiculo',
  templateUrl: './dialog-ver-veiculo.component.html',
  styleUrls: ['./dialog-ver-veiculo.component.scss']
})
export class DialogVerVeiculoComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data) {
    if (data) {
      if (data.veiculo) { this.carregarVeiculo = data.veiculo; }
    }
  }

  utility = Utility;

  adicionado: boolean = false;
  carregarVeiculo: Veiculo;
  veiculo: Veiculo;
  aditivo: boolean = false;
  tipoOperacao: number = null;

  ngOnInit(): void {
    //
  }

  setVeiculo(veiculo) {
    if (!veiculo) return;
    this.veiculo = <Veiculo>{
      chassi: veiculo.chassi,
      placa: veiculo.placa,
      ufPlaca: veiculo.ufPlaca,
      anoFabricacao: veiculo.anoFabricacao,
      anoModelo: veiculo.anoModelo,
      renavam: veiculo.renavam,
      numeroRestricao: +veiculo.numeroRestricao,
      marca: veiculo.marca,
      modelo: veiculo?.modelo,
      emplacado: veiculo.emplacado == "true",
      remarcado: veiculo.remarcado == "true",
      especie: veiculo.especie,
      cor: veiculo.cor,
      podeEditar: veiculo.podeEditar
    };
  }

  setNumeroRestricao(numeroRestricao) {
    this.veiculo.numeroRestricao = numeroRestricao;
  }

}
