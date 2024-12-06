import { Component, Input, OnInit } from '@angular/core';
import { BlocoVazio } from 'src/app/modules/sistemas/core/models/common/bloco-vazio.model';

@Component({
  selector: 'app-bloco-vazio',
  templateUrl: './bloco-vazio.component.html',
  styleUrls: ['./bloco-vazio.component.scss']
})
export class BlocoVazioComponent implements OnInit {

  constructor() { }

  @Input() options: BlocoVazio;

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    let subtitulo = this.options.subtitulo ?? `Nenhum registro <br>adicionado recentemente.`;
    document.getElementById('bloco_' + this.options.id).innerHTML = subtitulo;

    let mensagem = this.options.mensagem ?? `Continue utilizando a nossa plataforma para <br>ter a melhor experiência em nosso dashboard. `;
    document.getElementById('bloco_mensagem_' + this.options.id).innerHTML = mensagem;
  }
}
