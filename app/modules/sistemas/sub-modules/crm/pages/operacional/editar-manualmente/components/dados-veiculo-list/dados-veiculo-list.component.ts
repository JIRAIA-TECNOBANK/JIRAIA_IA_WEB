import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Veiculo } from '../../../../../../admin/core/models/_portal/contratos/veiculo.model';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Observable } from 'rxjs';
import { SubSink } from 'subsink';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { EditarManualmenteService } from '../../../../../services/editar-manualmente.service';
import { Utility } from 'src/app/core/common/utility';

@Component({
  selector: 'app-dados-veiculo-list',
  templateUrl: './dados-veiculo-list.component.html',
  styleUrls: ['./dados-veiculo-list.component.scss']
})
export class DadosVeiculoListComponent implements OnInit {

  constructor(private editarManualmenteService: EditarManualmenteService) { }

  utility = Utility;
  displayedColumns: string[] = [
    'ufchassi',
    'acoes'
  ];

  veiculosList: Veiculo[];
  dataSource = new MatTableDataSource([]);
  totalItems: number = 0;
  items$: Observable<Veiculo[]>;

  private subscriptions = new SubSink();

  @ViewChild('paginator') paginator: MatPaginator;
  @Output('verVeiculo') verVeiculo: EventEmitter<number> = new EventEmitter<number>();

  ngOnInit(): void {
    this.subscriptions.add(
      this.editarManualmenteService.veiculosAdicionados$.subscribe(value => {
        this.veiculosList = value;
        this.dataSource = new MatTableDataSource(this.veiculosList);
        this.totalItems = this.veiculosList.length;
        this.dataSource.paginator = this.paginator;
      })
    )
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  
  onClickVerVeiculo(id: number) {
    this.verVeiculo.emit(id);
  }

}
