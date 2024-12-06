import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-observacoes',
  templateUrl: './observacoes.component.html',
  styleUrls: ['./observacoes.component.scss']
})

export class ObservacoesComponent {

  @Input() observacao: string;

}
