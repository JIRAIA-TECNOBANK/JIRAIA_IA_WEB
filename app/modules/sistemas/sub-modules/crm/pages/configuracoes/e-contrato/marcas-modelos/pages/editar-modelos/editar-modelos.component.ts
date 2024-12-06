import { Component } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { ModelosFiltro } from 'src/app/modules/sistemas/sub-modules/crm/core/models/veiculos/modelos-filtro.model';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { DialogAdicionarModeloComponent } from './components/dialog-adicionar-modelo/dialog-adicionar-modelo.component';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { VeiculoService } from 'src/app/modules/sistemas/sub-modules/crm/services/veiculo.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { ActivatedRoute } from '@angular/router';
import { AdicionarModeloRequest } from 'src/app/modules/sistemas/sub-modules/crm/core/requests/veiculos/adicionar-modelo.request';

@Component({
  selector: 'app-editar-modelos',
  templateUrl: './editar-modelos.component.html',
  styleUrls: ['./editar-modelos.component.scss']
})
export class EditarModelosComponent {
  utility = Utility;

  showRedefinirBtn: boolean = false;
  refreshGrid: boolean = false;
  filtro: ModelosFiltro;
  filter: GridFilter = <GridFilter>{
    id: 'modelos',
    customFields: false,
    fields: [
      <FilterField>{
        id: 'modeloNome',
        titulo: 'Por nome',
        tipo: TipoFilterField.Text,
      },
      <FilterField>{
        id: 'modeloStatus',
        titulo: 'Por status',
        tipo: TipoFilterField.Checkbox,
        selectAllOptions: 'Todas',
        options: [
          <FieldOption>{ value: 1, label: 'Ativos' },
          <FieldOption>{ value: 0, label: 'Inativos' },
        ],
      },
    ],
  };

  marcaId: number;

  constructor(private dialog: MatDialog, private veiculoService: VeiculoService, private notifierService: NotifierService, private activeRoute: ActivatedRoute) {}

  ngAfterViewInit() {
    this.activeRoute.paramMap.subscribe(params => {
      this.marcaId = +params.get('marcaId');
    });
  }

  search(event) {
    let status: any = event.get('modeloStatus');
    if (status) {
      status = status.length > 1 ? null : status[0];
    }
    this.filtro = <ModelosFiltro>{
      Nome: event.get('modeloNome'),
      Status: status,
    };
    this.showRedefinirBtn = true;
  }

  redefinirFiltro() {
    this.filtro = null;
    // this.refreshUsuarioGrid = !this.refreshUsuarioGrid;
    this.showRedefinirBtn = false;
  }

  atualizarGrid() {
    this.refreshGrid = !this.refreshGrid;
  }

  openDialogAdicionarModelo() {
    const dialogRef = this.dialog.open(DialogAdicionarModeloComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'adicionar-modelo'),
      width: '500px',
      data: {}
    });

    dialogRef.afterClosed().subscribe((response: AdicionarModeloRequest) => {
      if (response) {
        response.marcaId = this.marcaId;
        response && this.adicionarModelo(response);
      }
    });
  }

  adicionarModelo(request: AdicionarModeloRequest) {
    this.veiculoService.adicionarModelo(request).subscribe((response) => {
      if (response.criado) {
        this.notifierService.showNotification('Modelo adicionado com sucesso!', 'Sucesso', 'success');
        this.atualizarGrid();
        return;
      }
      this.notifierService.showNotification(response.errors[0].message, null, 'error');
    })
  }
}
