import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-dialog-alerta-conteudo',
  templateUrl: './dialog-alerta-conteudo.component.html',
  styleUrls: ['./dialog-alerta-conteudo.component.scss']
})
export class DialogAlertaConteudoComponent {

  conteudo: string = '';
  pergunta: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data) {
    this.conteudo = this.data.conteudo;
    this.pergunta = this.data.pergunta;
  }

}
