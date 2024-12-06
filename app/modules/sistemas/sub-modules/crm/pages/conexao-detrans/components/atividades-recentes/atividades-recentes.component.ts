import { Component, Input, OnInit } from '@angular/core';
import { ConexaoDetrans } from '../../../../core/models/conexao-detrans/conexao-detrans.model';

@Component({
  selector: 'app-atividades-recentes',
  templateUrl: './atividades-recentes.component.html',
  styleUrls: ['./atividades-recentes.component.scss']
})
export class AtividadesRecentesComponent implements OnInit {

  _detrans: ConexaoDetrans;

  @Input('detrans')
  set detrans(val: ConexaoDetrans) {
    if(val) {
      this._detrans = val;
      this.isLoading = false;
    }
  }
  @Input('isLoading') isLoading: boolean;

  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 2000)
  }

}
