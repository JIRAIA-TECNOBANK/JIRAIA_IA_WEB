import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent {
  @Input()
  icone: string;

  @Input()
  titulo: string;

  @Input()
  mensagem: string;

  @Input() color: 'primary' | 'success' | 'warning' | 'error' = 'primary';

  constructor() { }
}
