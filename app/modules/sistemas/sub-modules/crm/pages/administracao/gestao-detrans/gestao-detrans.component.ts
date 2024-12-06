import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';

@Component({
  selector: 'app-gestao-detrans',
  templateUrl: './gestao-detrans.component.html',
  styleUrls: ['./gestao-detrans.component.scss']
})
export class GestaoDetransComponent {

  utility = Utility;
  Permissoes = Permissoes;

  constructor(private router: Router) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) this.childstate = val['url']?.includes('editar');
      if (!this.childstate) {
        this.atualizarGrid = !this.atualizarGrid;
      }
    });
  }

  childstate: boolean = false;
  atualizarGrid: boolean = false;

  onEditar() {
    this.childstate = true;
  }
}
