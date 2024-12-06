import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Utility } from 'src/app/core/common/utility';
import { ArquivoCompilado, StatusArquivoCompilado } from '../../../../core/model/arquivo-compilado.model';
import { HackatonService } from '../../../../services/hackaton.service';

@Component({
  selector: 'app-table-arquivo-compilado',
  templateUrl: './table-arquivo-compilado.component.html',
  styleUrls: ['./table-arquivo-compilado.component.scss']
})
export class TableArquivoCompiladoComponent implements OnInit {
  utility = Utility;

  displayedColumns: string[] = [
    'Nome',
    'Status',
    'CriadoEm',
    'ModificadoEm'
  ];

  totalItens = 0;

  items$: Observable<ArquivoCompilado[]>;

  constructor(private hackatonService: HackatonService) {}

  ngOnInit(){
    this.items$ = this.hackatonService.obterArquivosCompilados();
  }

  getStatusDescricao(status: number): string {
    switch (status) {
      case StatusArquivoCompilado.AguardandoProcessamento:
        return "Aguardando Processamento";
      case StatusArquivoCompilado.Processando:
        return "Processando";
      case StatusArquivoCompilado.ProcessadoComSucesso:
        return "Processado com Sucesso";
      case StatusArquivoCompilado.ProcessadoComErro:
        return "Processado com Erro";
      default:
        return "Status Desconhecido";
    }
  }
}
