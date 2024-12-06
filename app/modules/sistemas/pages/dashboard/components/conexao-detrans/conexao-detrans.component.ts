import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Utility } from 'src/app/core/common/utility';
import { ConexaoDetrans } from 'src/app/modules/sistemas/sub-modules/crm/core/models/conexao-detrans/conexao-detrans.model';
import { NotificacoesService } from 'src/app/modules/sistemas/sub-modules/crm/services/notificacoes.service';

@Component({
  selector: 'app-conexao-detrans',
  templateUrl: './conexao-detrans.component.html',
  styleUrls: ['./conexao-detrans.component.scss']
})
export class ConexaoDetransComponent implements OnInit {

  utility = Utility;

  constructor(private notificacoesService: NotificacoesService,
    private router: Router,
    private activatedRoute: ActivatedRoute) { }

  @Input('refresh') set refresh(value) { this.carregaMapaDetrans(); }

  conexoes: ConexaoDetrans;

  ngOnInit(): void {
    this.carregaMapaDetrans();
  }

  irParaConexaoDetrans() {
    this.router.navigate(['conexao-detrans'], { relativeTo: this.activatedRoute });
  }

  private carregaMapaDetrans() {
    this.notificacoesService.obterMapaDetrans().subscribe(result => {
      if (result.detrans) {
        this.conexoes = result;
      }
    })
  }

}
