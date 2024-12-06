import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Registro } from '../../../../core/model/registro.model';
import { Utility } from 'src/app/core/common/utility';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { NormativosService } from '../../../../services/normativos.service';
import { Instituicao } from '../../../../core/model/instituicao-financeira.model';

@Component({
  selector: 'app-modelo-regulamento',
  templateUrl: './modelo-regulamento.component.html',
  styleUrls: ['./modelo-regulamento.component.scss']
})
export class ModeloRegulamentoComponent {
  utility = Utility;

  @Input() dadosModeloRegulamento: any = null;
  @Input() subtitulo: string = '';
  @Input() skeletonGrid: boolean = true;
  @Input() uf: string = '';
  @Input() registroDeContrato: boolean = false;
  @Input() registroDeInstituicao: boolean = false;
  sucessoExpandido: boolean = false;

  ulAtivado: boolean = false;

  toggleVisibilidade() {
    this.ulAtivado = !this.ulAtivado
  }
}

