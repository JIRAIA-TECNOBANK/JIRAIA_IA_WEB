import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Utility } from 'src/app/core/common/utility';
import { ArquivoCompilado, StatusArquivoCompilado } from '../../../../core/model/arquivo-compilado.model';
import { HackatonService } from '../../../../services/hackaton.service';
import { ArquivoNormativo, StatusArquivoNormativo } from '../../../../core/model/arquivo-normativo.model';

@Component({
  selector: 'app-table-arquivo-normativo-rejeitado',
  templateUrl: './table-arquivo-normativo-rejeitado.component.html',
  styleUrls: ['./table-arquivo-normativo-rejeitado.component.scss']
})
export class TableArquivoNormativoRejeitadoComponent {
  utility = Utility;

  displayedColumns: string[] = [
    'NomePortaria',
    'Status',
    'EhVisaoEstadual',
    'TipoPortaria',
    'TipoRegistro',
    'Estado',
    'DataVigencia',
    'DtHrCriado',
    'DtHrModificado'
  ];


  totalItens = 0;

  items$: Observable<ArquivoNormativo[]>;

  constructor(private hackatonService: HackatonService) {}

  ngOnInit(){
    this.items$ = this.hackatonService.obterArquivosNormativosRejeitados();
  }
}
