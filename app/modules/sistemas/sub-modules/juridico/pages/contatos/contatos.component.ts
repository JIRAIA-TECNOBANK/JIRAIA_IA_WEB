import { Component } from '@angular/core'
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router'
import { Utility } from 'src/app/core/common/utility'
import { FiltroContatos } from '../../core/model/filtro-contatos.model'

@Component({
  selector: 'app-contatos',
  templateUrl: './contatos.component.html',
  styleUrls: ['./contatos.component.scss']
})
export class ContatosComponent {
  utility = Utility
  childstate: boolean = false
  activeIndex: number = 0
  refreshGrid: boolean = false
  filtroContatos: FiltroContatos = null

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ){
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd
      
      if (navEnd) {
        this.childstate = val['url']?.includes('incluir') || val['url']?.includes('editar')
        this.refreshGrid = !this.refreshGrid
      } 
    })
  }

  atualizarPagina() {
    this.refreshGrid = !this.refreshGrid
  }

  onTabChange(event: any) {
    this.activeIndex = event.index
    this.onChangeTab()
  }

  private onChangeTab() {
    const queryParams: Params = { 
      tab: this.retornaTabPorIndex(this.activeIndex) 
    }

    this.router.navigate([], { 
      relativeTo: this.activatedRoute, 
      queryParams: queryParams 
    })
  }

  private retornaTabPorIndex(index: number) {
    switch (index) {
      case 0: return 'contatos'
      
      default: return 'contatos'
    }
  }
}
