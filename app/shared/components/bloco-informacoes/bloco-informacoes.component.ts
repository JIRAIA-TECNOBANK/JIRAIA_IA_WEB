import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-bloco-informacoes',
  templateUrl: './bloco-informacoes.component.html',
  styleUrls: ['./bloco-informacoes.component.scss']
})
export class BlocoInformacoesComponent {
  @Input() options;

  icon: string = 'fa-regular fa-message-check';

  ngAfterViewInit() {
    let descricao = this.options.descricao;
    document.getElementById('bloco_descricao_' + this.options.id).innerHTML = descricao;

    if (this.options.icone) { this.icon = this.options.icone; }
  }

}
