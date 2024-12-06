import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { Utility } from 'src/app/core/common/utility';
import { FiltroGarantiasRegistros } from '../../core/model/filtro-garantias-registros.model';

@Component({
  selector: 'app-registros',
  templateUrl: './registros.component.html',
  styleUrls: ['./registros.component.scss']
})
export class RegistrosComponent implements OnInit {
  utility = Utility;
  childstate: boolean = false;
  activeIndex: number = 0;
  refreshGrid: boolean = false;
  filtroRegistros: FiltroGarantiasRegistros = null
  filtroGarantias: FiltroGarantiasRegistros = null
  tabelaAtual: number = 0

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ){
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) {
        this.childstate = val['url']?.includes('incluir') || val['url']?.includes('editar');
        this.refreshGrid = !this.refreshGrid;
      } 
    })
  }

  ngOnInit(): void {
    const tabelaSalva = localStorage.getItem('tabelaSalva')

    if(tabelaSalva) {
      this.activeIndex = parseInt(tabelaSalva)
      this.tabelaAtual = this.activeIndex
    }
  }

  onTabChange(event: any) {
    this.activeIndex = event.index;
    this.onChangeTab();
    this.tabelaAtual = event.index
    localStorage.setItem('tabelaSalva', this.activeIndex.toString())
  }

  atualizarPagina() {
    this.refreshGrid = !this.refreshGrid;
  }

  private onChangeTab() {
    const queryParams: Params = { tab: this.retornaTabPorIndex(this.activeIndex) };
    this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: queryParams });
  }

  private retornaTabPorIndex(index: number) {
    switch (index) {
      case 0: return 'registros';
      default: return 'registros'
    }
  }
}
