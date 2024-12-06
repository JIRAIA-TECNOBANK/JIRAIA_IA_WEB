import { Component } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Utility } from 'src/app/core/common/utility';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { MarcasFiltro } from '../../../../core/models/veiculos/marcas-filtro.model';
import { EspeciesFiltro } from '../../../../core/models/veiculos/especies-filtro.model';
import { CoresFiltro } from '../../../../core/models/veiculos/cores-filtro.model';
import { DialogAdicionarCorComponent } from './components/dialog-adicionar-cor/dialog-adicionar-cor.component';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { VeiculoService } from '../../../../services/veiculo.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { DialogAdicionarEspecieComponent } from './components/dialog-adicionar-especie/dialog-adicionar-especie.component';
import { DialogAdicionarMarcaComponent } from './components/dialog-adicionar-marca/dialog-adicionar-marca.component';
import { Cor } from '../../../../core/models/veiculos/cor.model';
import { Especie } from '../../../../core/models/veiculos/especie.model';
import { Marcas } from '../../../../core/models/veiculos/marcas.model';

@Component({
  selector: 'app-marcas-modelos',
  templateUrl: './marcas-modelos.component.html',
  styleUrls: ['./marcas-modelos.component.scss'],
})
export class MarcasModelosComponent {
  utility = Utility;

  tabName: string = 'Marca';

  showRedefinirMarcasBtn: boolean = false;
  refreshMarcaGrid: boolean = false;
  filtroMarcas: MarcasFiltro;
  filterMarcas: GridFilter = <GridFilter>{
    id: 'marcas',
    customFields: false,
    fields: [
      <FilterField>{
        id: 'marcaNome',
        titulo: 'Por nome',
        tipo: TipoFilterField.Text,
      },
      <FilterField>{
        id: 'marcaStatus',
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

  showRedefinirEspeciesBtn: boolean = false;
  refreshEspecieGrid: boolean = false;
  filtroEspecies: EspeciesFiltro;
  filterEspecies: GridFilter = <GridFilter>{
    id: 'especies',
    customFields: false,
    fields: [
      <FilterField>{
        id: 'especieNome',
        titulo: 'Por nome',
        tipo: TipoFilterField.Text,
      },
      <FilterField>{
        id: 'especieStatus',
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

  showRedefinirCoresBtn: boolean = false;
  refreshCorGrid: boolean = false;
  filtroCores: CoresFiltro;
  filterCores: GridFilter = <GridFilter>{
    id: 'cores',
    customFields: false,
    fields: [
      <FilterField>{
        id: 'corNome',
        titulo: 'Por nome',
        tipo: TipoFilterField.Text,
      },
      <FilterField>{
        id: 'corStatus',
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

  constructor(private dialog: MatDialog, private veiculoService: VeiculoService, private notifierService: NotifierService) {}

  searchMarcas(event) {
    let status: any = event.get('marcaStatus');
    if (status) {
      status = status.length > 1 ? null : status[0];
    }
    this.filtroMarcas = <MarcasFiltro>{
      Nome: event.get('marcaNome'),
      Status: status,
    };
    this.showRedefinirMarcasBtn = true;
  }

  redefinirMarcasFiltro() {
    this.filtroMarcas = null;
    // this.refreshUsuarioGrid = !this.refreshUsuarioGrid;
    this.showRedefinirMarcasBtn = false;
  }

  searchEspecies(event) {
    let status: any = event.get('especieStatus');
    if (status) {
      status = status.length > 1 ? null : status[0];
    }
    this.filtroEspecies = <EspeciesFiltro>{
      Nome: event.get('especieNome'),
      Status: status,
    };
    this.showRedefinirEspeciesBtn = true;
  }

  redefinirEspeciesFiltro() {
    this.filtroEspecies = null;
    // this.refreshUsuarioGrid = !this.refreshUsuarioGrid;
    this.showRedefinirEspeciesBtn = false;
  }

  searchCores(event) {
    let status: any = event.get('corStatus');
    if (status) {
      status = status.length > 1 ? null : status[0];
    }
    this.filtroCores = <CoresFiltro>{
      Nome: event.get('corNome'),
      Status: status,
    };
    this.showRedefinirCoresBtn = true;
  }

  redefinirCoresFiltro() {
    this.filtroCores = null;
    // this.refreshUsuarioGrid = !this.refreshUsuarioGrid;
    this.showRedefinirCoresBtn = false;
  }

  onTabChange(event: MatTabChangeEvent) {
    this.tabName = event.index === null ? '' : event.tab.textLabel;
  }

  selectDialog() {
    switch (this.tabName) {
      case 'Marca':
        this.openDialogAdicionarMarca();
        break;

      case 'Espécie':
        this.openDialogAdicionarEspecie();
        break;

      case 'Cor':
        this.openDialogAdicionarCor();
        break;
    }
  }

  openDialogAdicionarMarca() {
    const dialogRef = this.dialog.open(DialogAdicionarMarcaComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'adicionar-marca'),
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((marca: Marcas) => {
      marca && this.adicionarMarca(marca);
    });
  }

  adicionarMarca(marca: Marcas) {
    this.veiculoService.adicionarMarca(marca).subscribe((response) => {
      if (response.criado) {
        this.notifierService.showNotification('Marca adicionada com sucesso!', 'Sucesso', 'success');
        this.refreshMarcaGrid = !this.refreshMarcaGrid;
        return;
      }
      this.notifierService.showNotification(response.errors[0].message, null, 'error')
    })
  }

  openDialogAdicionarEspecie() {
    const dialogRef = this.dialog.open(DialogAdicionarEspecieComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'adicionar-especie'),
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((especie: Especie ) => {
      especie && this.adicionarEspecie(especie);
    });
  }

  adicionarEspecie(especie: Especie) {
    this.veiculoService.adicionarEspecie(especie).subscribe((response) => {
      if (response.criado) {
        this.notifierService.showNotification('Espécie adicionada com sucesso!', 'Sucesso', 'success');
        this.refreshEspecieGrid = !this.refreshEspecieGrid;
        return;
      }
      this.notifierService.showNotification(response.errors[0].message, null, 'error')
    })
  }

  openDialogAdicionarCor() {
    const dialogRef = this.dialog.open(DialogAdicionarCorComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'adicionar-cor'),
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((cor: Cor) => {
      cor && this.adicionarCor(cor);
    });
  }

  adicionarCor(cor: Cor) {
    this.veiculoService.adicionarCor(cor).subscribe((response) => {
      if (response.criado) {
        this.notifierService.showNotification('Cor adicionada com sucesso!', 'Sucesso', 'success');
        this.refreshCorGrid = !this.refreshCorGrid;
        return;
      }
      this.notifierService.showNotification(response.errors[0].message, null, 'error');
    })
  }

  atualizarMarcaGrid() {
    this.refreshMarcaGrid = !this.refreshMarcaGrid;
  }

  atualizarEspecieGrid() {
    this.refreshEspecieGrid = !this.refreshEspecieGrid;
  }

  atualizarCorGrid() {
    this.refreshCorGrid = !this.refreshCorGrid;
  }

  
}
