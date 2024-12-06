import { Component, Input, OnInit } from '@angular/core';
import { ConexaoDetrans } from '../../../../core/models/conexao-detrans/conexao-detrans.model';
@Component({
  selector: 'app-mapa-conexao',
  templateUrl: './mapa-conexao.component.html',
  styleUrls: ['./mapa-conexao.component.scss']
})
export class MapaConexaoComponent implements OnInit {

  _conexoesDetrans: ConexaoDetrans;

  @Input('conexoesDetrans')
  set conexoesDetrans(val: ConexaoDetrans) {
    if (val) {
      this._conexoesDetrans = val;
      this.carregarMapaDetrans();
    }
  }

  // Array para armazenar os estados do mapa
  estadosCollection = [];

  tooltipData: string = '';
  tooltipHora: string = '';
  tooltipUF: string = '';

  resizeble: number = 0;

  constructor() { }

  $primary = '#1666AE';
  $warning_900 = '#FFAF3F';

  ngOnInit(): void {
    //
  }

  carregarMapaDetrans() {
    // Pega todos os estados como elementos html e insere no array
    this.estadosCollection = Array.from(document.getElementsByClassName('state-item'));

    // Compara os estados disponíveis da lista de conexoesDetrans com o mapa e remove a classe state-disabled somente nos estados presentes na lista de conexoesDetrans
    for (let i = 0; i < this.estadosCollection.length; i++) {
      for (let j = 0; j < this._conexoesDetrans.detrans.length; j++) {

        if (this.estadosCollection[i].id == this._conexoesDetrans.detrans[j].uf && this._conexoesDetrans.detrans[j].ativo) {

          this.estadosCollection[i].classList.remove('state-disabled');
          this.estadosCollection[i].classList.add('state');

          let path = 'shape_' + this.estadosCollection[i].id.toLowerCase();
          let circle = 'icon_' + this.estadosCollection[i].id.toLowerCase();
          const svgElement = document.getElementById(path);
          const svgElementIcon = document.getElementById(circle);

          if (this._conexoesDetrans.detrans[j].conectado) {
            this.estadosCollection[i].classList.add('conectado');
            svgElement.style.fill = this.$primary;
            if (svgElementIcon) { svgElementIcon.style.fill = this.$primary; }

          } else {
            this.estadosCollection[i].classList.add('nao-identificado');
            if (svgElement) { svgElement.style.fill = this.$warning_900; }
            if (svgElementIcon) { svgElementIcon.style.fill = this.$warning_900; }
          }
        }
      }
    }
  }

  showTooltip(event) {
    // Desabilita tooltip nos estados desabilitados
    if (event.srcElement.parentElement.classList[0] == 'state-disabled') {
      return
    }
    let clickedState = event.srcElement.parentElement.id;
    // Define a visibilidade e posição do tooltip
    let tooltip = document.getElementById("tooltip");
    if (this.tooltipUF != clickedState) {
      tooltip.style.display = "block";
      tooltip.style.left = event.offsetX - 70 + 'px';
      tooltip.style.top = event.offsetY - 92 + 'px';
    } else {
      tooltip.style.display = "none";
      this.tooltipUF = '';
      return;
    }

    // Obtem os dados do estado clicado na lista de conexoesDetrans
    this._conexoesDetrans.detrans.forEach((element) => {
      if (element.uf == clickedState) {
        this.tooltipData = element.data;
        this.tooltipHora = element.hora;
        this.tooltipUF = element.uf;
      }
    })
  }

  hideTooltip() {
    let tooltip = document.getElementById("tooltip");
    tooltip.style.display = "block";
  }
}
