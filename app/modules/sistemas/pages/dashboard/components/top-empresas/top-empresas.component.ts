import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Utility } from 'src/app/core/common/utility';
import { BlocoVazio } from 'src/app/modules/sistemas/core/models/common/bloco-vazio.model';
import { FiltroGraficosComplementares } from 'src/app/modules/sistemas/sub-modules/crm/core/models/dashboard/filtro-graficos-complementares.model';
import { TopEmpresas } from 'src/app/modules/sistemas/sub-modules/crm/core/models/dashboard/top-empresas.model';
import { DashboardService } from 'src/app/modules/sistemas/sub-modules/crm/services/dashboard.service';
import { DominioService } from 'src/app/modules/sistemas/sub-modules/crm/services/dominio.service';
import { SortByPipe } from 'src/app/shared/pipes/sort-by.pipe';

@Component({
  selector: 'app-top-empresas',
  templateUrl: './top-empresas.component.html',
  styleUrls: ['./top-empresas.component.scss']
})
export class TopEmpresasComponent {

  @Input('filtro') filtro: FiltroGraficosComplementares;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @Output('mostrarDetalhes') expandido: EventEmitter<boolean> = new EventEmitter<boolean>();

  utility = Utility;

  mostrarDetalhes: boolean = false;
  ufDetrans: string[] = [];
  ufsSelecionadas = new SelectionModel<string>(true, []);
  topEmpresas: TopEmpresas[] = [];
  sucesso: boolean = true;
  loading: boolean = false;

  sortPipe = new SortByPipe();

  blocoVazio: BlocoVazio = {
    id: 'top-empresas',
    titulo: this.sucesso ? 'Top empresas com mais registros' : 'Top empresas com mais inconsistências',
    icone: './../../../../assets/img/custom-icons/icone-vazio-top-empresas.svg',
    subtitulo: `No momento, não é possível visualizar <br>as top 10 empresas.`,
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
      this.topEmpresas = [];

      this.carregarEmpresasSeSucesso();
    }

    this.expandido.emit(this.mostrarDetalhes);
  }

  carregarEmpresasSucesso() {
    this.loading = true;
    this.sucesso = true;
    this.topEmpresas = [];

    this.dashboardService.obterTopEmpresasSucesso(this.filtro.dataInicio, this.filtro.dataFim, this.ufsSelecionadas.selected).subscribe(response => {
      this.topEmpresas = response.topEmpresas;
      this.loading = false;
    })
  }

  carregarEmpresasInconsistencia() {
    this.loading = true;
    this.sucesso = false;
    this.topEmpresas = [];

    this.dashboardService.obterTopEmpresasInconsistencia(this.filtro.dataInicio, this.filtro.dataFim, this.ufsSelecionadas.selected).subscribe(response => {
      this.topEmpresas = response.topEmpresas;
      this.loading = false;
    })
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  limparFiltros() {
    this.ufDetrans.forEach(u => { this.ufsSelecionadas.deselect(u) });
    this.carregarEmpresasSeSucesso();
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

    this.carregarEmpresasSeSucesso();
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
        this.carregarEmpresasSeSucesso();
        return;
      }
    }

    this.ufsSelecionadas.select(uf);
    this.carregarEmpresasSeSucesso();
  }

  isSelected(uf) {
    if (this.ufsSelecionadas.selected.length > 0) {
      return (this.ufsSelecionadas.selected.filter(u => u === uf).length > 0);
    }

    return this.ufsSelecionadas.isSelected(uf);
  }

  private carregarEmpresasSeSucesso() {
    if (this.sucesso) { this.carregarEmpresasSucesso(); }
    else { this.carregarEmpresasInconsistencia(); }
  }
}
