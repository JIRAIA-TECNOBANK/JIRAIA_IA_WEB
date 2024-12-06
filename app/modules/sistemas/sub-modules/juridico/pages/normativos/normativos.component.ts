import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { Utility } from 'src/app/core/common/utility';
import { FiltroNormativos } from '../../core/model/normativos.model';

@Component({
  selector: 'app-normativos',
  templateUrl: './normativos.component.html',
  styleUrls: ['./normativos.component.scss']
})
export class NormativosComponent {
  utility = Utility;
  activeIndex: number = 0;
  childstate: boolean = false;
  filtroNormativos: FiltroNormativos = null;
  refreshGrid: boolean = false;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute) {
      router.events.subscribe((val) => {
        let navEnd = val instanceof NavigationEnd;
        if (navEnd) {
          this.childstate = val['url']?.includes('incluir') || val['url']?.includes('editar');
          this.refreshGrid = !this.refreshGrid;
        }
      })
  }

  atualizarPagina() {
    this.refreshGrid = !this.refreshGrid;
  }

  onTabChange(event: any) {
    this.activeIndex = event.index;

    this.onChangeTab();
  }

  private onChangeTab() {
    const queryParams: Params = { tab: this.retornaTabPorIndex(this.activeIndex) };
    this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: queryParams });
  }

  private retornaTabPorIndex(index: number) {
    switch (index) {
      case 0: return 'normativos';
      case 1: return 'lotes-normativos';
      default: return 'normativos'
    }
  }
}
