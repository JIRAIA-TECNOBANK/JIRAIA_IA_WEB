import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Utility } from 'src/app/core/common/utility';
import { BlocoVazio } from 'src/app/modules/sistemas/core/models/common/bloco-vazio.model';
import { FiltroGraficosComplementares } from 'src/app/modules/sistemas/sub-modules/crm/core/models/dashboard/filtro-graficos-complementares.model';
import { TopInconsistencias } from 'src/app/modules/sistemas/sub-modules/crm/core/models/dashboard/top-inconsistencias.model';
import { DashboardService } from 'src/app/modules/sistemas/sub-modules/crm/services/dashboard.service';
import { DominioService } from 'src/app/modules/sistemas/sub-modules/crm/services/dominio.service';

@Component({
  selector: 'app-top-inconsistencias',
  templateUrl: './top-inconsistencias.component.html',
  styleUrls: ['./top-inconsistencias.component.scss']
})
export class TopInconsistenciasComponent {

  @Input('filtro') filtro: FiltroGraficosComplementares;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @Output('mostrarDetalhes') expandido: EventEmitter<boolean> = new EventEmitter<boolean>();

  utility = Utility;

  mostrarDetalhes: boolean = false;
  ufDetrans: string[] = [];
  ufsSelecionadas = new SelectionModel<string>(true, []);
  topInconsistencias: TopInconsistencias[] = [];
  loading: boolean = false;

  blocoVazio: BlocoVazio = {
    id: 'top-inconsistencias',
    titulo: 'Top inconsistências',
    icone: './../../../../assets/img/custom-icons/icone-vazio-exclamacao.svg',
    subtitulo: `Nenhuma operação <br>com inconsistência adicionada recentemente.`,
    mensagem: `Continue utilizando a nossa plataforma para <br>ter a melhor experiência em nosso dashboard.`,
  };

  constructor(private dashboardService: DashboardService,
    private dominioService: DominioService) { }

  ngOnInit() {
    this.carregarDetrans();
  }

  ngOnChanges() {
    this.mostrarDetalhes = false;
    this.expandido.emit(this.mostrarDetalhes);
    this.limparFiltros();
  }

  expandirDetalhes() {
    this.mostrarDetalhes = !this.mostrarDetalhes;

    if (this.mostrarDetalhes) {
      this.topInconsistencias = [];

      this.carregarTopInconsistencias();
    }

    this.expandido.emit(this.mostrarDetalhes);
  }

  carregarTopInconsistencias() {
    this.loading = true;
    this.topInconsistencias = [];

    this.dashboardService.obterTopInconsistencias(this.filtro.dataInicio, this.filtro.dataFim, this.ufsSelecionadas.selected).subscribe(response => {
      this.topInconsistencias = response.topInconsistencias;
      this.loading = false;
    })
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  limparFiltros() {
    this.ufDetrans.forEach(u => { this.ufsSelecionadas.deselect(u) });
    this.carregarTopInconsistencias();
  }

  private carregarDetrans() {
    this.dominioService.obterPorTipo('UF_DETRAN').subscribe((result) => {
      let ufsOrdenadas = Utility.sortValues(result.valorDominio, 'valor');
      ufsOrdenadas.forEach((uf) => {
        this.ufDetrans.push(uf.valor);
      });
    });
  }

  selecionarTodasUfs(event) {
    if (event.checked) {
      this.ufDetrans.forEach(u => { this.ufsSelecionadas.select(u) })
    } else {
      this.ufDetrans.forEach(u => { this.ufsSelecionadas.deselect(u) })
    }

    this.carregarTopInconsistencias();
  }

  verificarUfSelecionada() {
    if (this.ufsSelecionadas.selected.length === 0) return 0;
    if (this.ufsSelecionadas.selected.length === this.ufDetrans.length) return 1;
    return 2;
  }

  check(uf: string) {
    if (this.ufsSelecionadas.selected.length > 0) {
      if (this.ufsSelecionadas.selected.filter(u => u === uf).length > 0) {
        this.ufsSelecionadas.deselect(this.ufsSelecionadas.selected.filter(u => u === uf)[0]);
        this.carregarTopInconsistencias();
        return;
      }
    }

    this.ufsSelecionadas.select(uf);
    this.carregarTopInconsistencias();
  }

  isSelected(uf) {
    if (this.ufsSelecionadas.selected.length > 0) {
      return (this.ufsSelecionadas.selected.filter(u => u === uf).length > 0);
    }

    return this.ufsSelecionadas.isSelected(uf);
  }
}
