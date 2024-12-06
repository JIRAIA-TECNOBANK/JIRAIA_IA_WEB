import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';

@Component({
  selector: 'app-atualizar-pagina',
  templateUrl: './atualizar-pagina.component.html',
  styleUrls: ['./atualizar-pagina.component.scss']
})
export class AtualizarPaginaComponent implements OnInit {

  constructor() { }

  utility = Utility;

  horaAtualizacao: string;
  pipe = new DatePipe('en-US');

  @Output('atualizar') atualizar: EventEmitter<boolean> = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.horaAtualizacao = this.pipe.transform(new Date(), 'HH:mm:ss');
  }

  atualizarPagina() {
    this.atualizar.emit(true);
    this.horaAtualizacao = this.pipe.transform(new Date(), 'HH:mm:ss');
  }

}
