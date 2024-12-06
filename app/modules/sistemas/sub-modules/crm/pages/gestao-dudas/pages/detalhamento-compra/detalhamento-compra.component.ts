import { Component, OnInit } from '@angular/core';
import { DetalhamentoDudaFiltro } from '../../../../core/models/taxas/detalhamento-duda-filtro.model';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FilterCustomField } from 'src/app/shared/core/models/grid-filter/filter-custom-field.model';
import { DominiosResponse } from '../../../../core/responses/dominios/dominios.response';
import { PortalDominioService } from 'src/app/modules/sistemas/sub-modules/admin/services/_portal/portal-dominio.service';
import { Utility } from 'src/app/core/common/utility';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-detalhamento-compra',
  templateUrl: './detalhamento-compra.component.html',
  styleUrls: ['./detalhamento-compra.component.scss']
})
export class DetalhamentoCompraComponent implements OnInit {

  private parametrizaDudaId: number;
  private empresaNome: string;
  private empresaCnpj: string;
  private titulo: string;

  public utility = Utility;
  public showRedefinirBtn: boolean = false;
  public redefinirField: boolean = false;
  public refreshGrid: boolean = false;

  public filtro: DetalhamentoDudaFiltro;

  fieldPeriodo: FilterField = <FilterField>{
    id: 'Periodo',
    titulo: 'Por período',
    tipo: TipoFilterField.Period,
    options: [],
    customFields: [
      <FilterCustomField>{ id: 'De' },
      <FilterCustomField>{ id: 'Ate' },
    ],
  };

  public gridFilter: GridFilter = <GridFilter>{
    id: 'detalhamento-dudas',
    customFields: false,
    fields: [
      this.fieldPeriodo,
    ],
  };
  public requiredFieldsError: boolean = false;

  public erroDataFinal: boolean = false;

  constructor(
    private portalDominioService: PortalDominioService,
    private activatedRoute: ActivatedRoute) {
    this.parametrizaDudaId = this.activatedRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.carregarPeriodo();
  }

  private carregarPeriodo() {
    this.fieldPeriodo.options = [];
    this.portalDominioService.obterPorTipo('PERIODO').subscribe(
      (response: DominiosResponse) => {
        if (response.isSuccessful) {
          let periodos = response.valorDominio;
          periodos.forEach((periodo) => {
            this.fieldPeriodo.options.push(<FieldOption>{
              value: periodo.palavraChave,
              label: periodo.valor,
            });
          });

          this.gridFilter = <GridFilter>{
            id: 'detalhamento-duda',
            customFields: false,
            options: periodos,
            fields: [
              this.fieldPeriodo,
            ]
          };
        }

        response.errors.forEach((error) => {
          console.info(`${error.code}-${error.message}`);
        });
      },
      (error) => console.info(error)
    );
  }

  search(event) {
    this.filtro = <DetalhamentoDudaFiltro>{
      de: event.get('De'),
      ate: event.get('Ate'),
    };

    this.showRedefinirBtn = true;
  }

  atualizarPagina() {
    this.refreshGrid = !this.refreshGrid
  }

  public redefinir() {
    this.filtro = null;
    this.showRedefinirBtn = false;
  }
}
