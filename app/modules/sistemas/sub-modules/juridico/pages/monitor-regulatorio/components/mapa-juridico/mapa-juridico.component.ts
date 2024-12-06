import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Ufs } from '../../../../core/model/ufs.model';
import { catchError, of } from 'rxjs';
import { NormativosService } from '../../../../services/normativos.service';

@Component({
  selector: 'app-mapa-juridico',
  templateUrl: './mapa-juridico.component.html',
  styleUrls: ['./mapa-juridico.component.scss'],
})
export class MapaJuridicoComponent implements OnInit, OnChanges {

  estadosCollection = [];
  ufSelecionada: string = null;
  ufsAtualizadas: Ufs[] = [];

  $primary = '#1666AE';
  $blue_600 = '#5B94C7'
  $warning_900 = '#FFAF3F';

  @Output('estadoSelecionado') estadoSelecionado: EventEmitter<string> = new EventEmitter<string>();
  @Input() limparFiltros: boolean = false;

  constructor(
    private normativoService: NormativosService
  ) { }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.limparFiltros && !changes.limparFiltros.firstChange) {
      if (this.limparFiltros) {
        this.selecionarUf(this.ufSelecionada);
      }
    }
  }
  ngOnInit() {
    this.carregarMapaDetrans();
    this.carregarUfsAtualizadas();
  }

  private carregarUfsAtualizadas() {
    this.normativoService.obterUfsParaAtualizacao().pipe(
      catchError(error => {
        if (error.status === 404) {
          this.ufsAtualizadas = [];
          this.carregarMapaDetrans();
          return of(null);
        } else {
          console.error('An error occurred:', error);
          return of(null);
        }
      })
    ).subscribe((result: any) => {
      if (result) {
        this.ufsAtualizadas = result.ufsRecentes.result.ufs;
        this.carregarMapaDetrans();
      }
    });
  }

  carregarMapaDetrans() {
    this.estadosCollection = Array.from(document.getElementsByClassName('state-item'));
    for (let i = 0; i < this.estadosCollection.length; i++) {
      this.estadosCollection[i].classList.remove('state-notification');
      this.estadosCollection[i].classList.add('state');

      let path = 'shape_' + this.estadosCollection[i].id.toLowerCase();
      let circle = 'icon_' + this.estadosCollection[i].id.toLowerCase();

      const svgElement = document.getElementById(path);
      const svgElementIcon = document.getElementById(circle);

      this.estadosCollection[i].classList.remove('inativo');
      this.estadosCollection[i].classList.add('ativo');

      svgElement && (svgElement.style.fill = this.$blue_600);
      svgElementIcon && (svgElementIcon.style.fill = this.$blue_600);

      if (this.ufsAtualizadas.some((uf) => uf === this.estadosCollection[i].id)) {
        this.estadosCollection[i].classList.add('notification');
        if (svgElement) { svgElement.style.fill = this.$warning_900; }
        if (svgElementIcon) { svgElementIcon.style.fill = this.$warning_900; }
      }
    }
  }

  selecionarUf(estado: string) {
    const estadoSelecionado = this.estadosCollection.find((estadoColection) => estadoColection.id === estado);

    if (!estadoSelecionado) {
      return;
    }

    const estadoAnterior = this.estadosCollection.find((estadoColection) => estadoColection.id === this.ufSelecionada);

    const svgElementEstadoAnterior = estadoAnterior && this.criarElementoSvg(estadoAnterior);
    const svgElementIconeEstadoAnterior = estadoAnterior && this.criarElementoIconeSvg(estadoAnterior);

    const svgElementEstadoAtual = this.criarElementoSvg(estadoSelecionado);
    const svgElementIconeEstadoAtual = this.criarElementoIconeSvg(estadoSelecionado);

    //Colorir SVG estado
    if (svgElementEstadoAtual) {
      if (this.temUfAtualizada(estado)) {
        if (estado === this.ufSelecionada) {
          svgElementEstadoAtual.style.fill = this.$warning_900;
        }
        else {
          svgElementEstadoAtual.style.fill = this.$primary;
        }
      }
      else if (estado === this.ufSelecionada) {
        svgElementEstadoAtual.style.fill = this.$blue_600;
      }
      else {
        svgElementEstadoAtual.style.fill = this.$primary;
      }
    }

    //Colorir SVG Icone estado
    if (svgElementIconeEstadoAtual) {
      if (this.temUfAtualizada(estado)) {
        if (estado === this.ufSelecionada) {
          svgElementIconeEstadoAtual.style.fill = this.$warning_900;
        }
        else {
          svgElementIconeEstadoAtual.style.fill = this.$primary;
        }
      }
      else if (estado === this.ufSelecionada) {
        svgElementIconeEstadoAtual.style.fill = this.$blue_600;
      }
      else {
        svgElementIconeEstadoAtual.style.fill = this.$primary;
      }
    }

    if (estado !== this.ufSelecionada) {
      if (svgElementEstadoAnterior) {
        svgElementEstadoAnterior.style.fill = this.$blue_600;
      }

      if (svgElementIconeEstadoAnterior) {
        svgElementIconeEstadoAnterior.style.fill = this.$blue_600;
      }

      if (this.temUfAtualizada(this.ufSelecionada)) {
        svgElementEstadoAnterior && (svgElementEstadoAnterior.style.fill = this.$warning_900);
        svgElementIconeEstadoAnterior && (svgElementIconeEstadoAnterior.style.fill = this.$warning_900);
      }

      this.ufSelecionada = estado;
    } else {
      if (this.temUfAtualizada(estado)) {
        if (estado === this.ufSelecionada) {
          svgElementEstadoAnterior && (svgElementEstadoAnterior.style.fill = this.$warning_900);
          svgElementIconeEstadoAnterior && (svgElementIconeEstadoAnterior.style.fill = this.$warning_900);
        }
        else {
          svgElementEstadoAnterior && (svgElementEstadoAnterior.style.fill = this.$primary);
          svgElementIconeEstadoAnterior && (svgElementIconeEstadoAnterior.style.fill = this.$primary);
        }
      }
      this.ufSelecionada = null;
    }
    this.estadoSelecionado.emit(estado);
  }

  private temUfAtualizada(ufAtual: string) {
    return this.ufsAtualizadas.some((uf: any) => uf === ufAtual);
  }

  private criarElementoSvg(estado: any): any {
    let path = 'shape_' + estado.id.toLowerCase();
    return document.getElementById(path);
  }

  private criarElementoIconeSvg(estado: any): any {
    let circle = 'icon_' + estado.id.toLowerCase();
    return document.getElementById(circle);
  }
}
