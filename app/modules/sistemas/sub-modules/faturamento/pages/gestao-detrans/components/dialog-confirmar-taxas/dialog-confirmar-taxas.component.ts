import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-dialog-confirmar-taxas',
  templateUrl: './dialog-confirmar-taxas.component.html',
  styleUrls: ['./dialog-confirmar-taxas.component.scss']
})
export class DialogConfirmarTaxasComponent {

  statusAtual: string = 'Agendado';

  constructor(@Inject(MAT_DIALOG_DATA) public data) {
    if (this.data?.statusAtual) this.statusAtual = this.data.statusAtual;
  }
}
