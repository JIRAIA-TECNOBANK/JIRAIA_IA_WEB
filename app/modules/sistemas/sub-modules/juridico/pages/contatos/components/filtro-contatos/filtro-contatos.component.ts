import { DatePipe } from '@angular/common'
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core'
import { AbstractControl, FormControl, Validators } from '@angular/forms'
import { Utility } from 'src/app/core/common/utility'
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum'
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model'
import { FilterFieldReturn } from 'src/app/shared/core/models/grid-filter/filter-field-return.model'
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model'
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model'
import { FiltroContatos } from '../../../../core/model/filtro-contatos.model'
import { DominioService } from '../../../../services/dominio.service'


@Component({
  selector: 'app-filtro-contatos',
  templateUrl: './filtro-contatos.component.html',
  styleUrls: ['./filtro-contatos.component.scss']
})
export class FiltroContatosComponent {
  utility = Utility

  fieldUf: FilterField = <FilterField>{
    id: 'Uf',
    titulo: 'Por UF',
    tipo: TipoFilterField.Checkbox,
    options: [],
    selectAllOptions: 'Todas',
  }

  fieldNome: FilterField = <FilterField>{
    id: 'nome',
    titulo: 'Por nome',
    tipo: TipoFilterField.Text
  }

  fieldCargo: FilterField = <FilterField>{
    id: 'cargo',
    titulo: 'Por cargo',
    tipo: TipoFilterField.Text
  }

  fieldOrgao: FilterField = <FilterField>{
    id: 'orgao',
    titulo: 'Por órgão',
    tipo: TipoFilterField.Text
  }

  filter: GridFilter = <GridFilter>{
    id: 'contatos',
    customFields: true,
    fields: [
      this.fieldUf,
      this.fieldNome,
      this.fieldCargo,
      this.fieldOrgao
    ],
  }

  filtroContatos: FiltroContatos
  ufControl: FormControl
  nomeControl: FormControl
  cargoControl: FormControl
  orgaoControl: FormControl

  refreshGrid: boolean = false
  showRedefinirBtn: boolean = false
  requiredFieldsError: boolean = false
  erroDataFinal: boolean = false

  pipe = new DatePipe('pt-BR')

  @Output('filtro') filtro: EventEmitter<FiltroContatos> = new EventEmitter<FiltroContatos>()

  constructor(
    private dominioService: DominioService,
  ) {}

  ngOnInit() {
    this.carregarUfs()
  }

  search(event) {
    let uf = event.get(this.fieldUf.id)
    let nome = event.get(this.fieldNome.id)      
    let cargo = event.get(this.fieldCargo.id)      
    let orgao = event.get(this.fieldOrgao.id)        

    this.filtroContatos = <FiltroContatos>{
      uf: uf?.length > 0 ? uf : [],
      nome: nome? nome: '',
      cargo: cargo? cargo: '',
      orgao: orgao? orgao: '',
    }

    this.filtro.emit(this.filtroContatos)
    this.showRedefinirBtn = true
  }

  redefinirFiltros() {
    this.filtroContatos = null
    this.refreshGrid = !this.refreshGrid
    this.showRedefinirBtn = false
    this.filtro.emit(this.filtroContatos)
  }

  setCustomControls(event: Map<string, AbstractControl>) {
    this.ufControl = event.get(this.fieldUf.id) as FormControl
    this.nomeControl = event.get(this.fieldNome.id) as FormControl
    this.cargoControl = event.get(this.fieldCargo.id) as FormControl
    this.orgaoControl = event.get(this.fieldOrgao.id) as FormControl
  }

  redefinir(control: FormControl) {
    control.reset()
  }

  selectAll(fieldReturn: FilterFieldReturn, filtro: string) {
    switch (filtro) {
      case 'uf':
        this.selectAllOptions(
          this.ufControl,
          fieldReturn.selected,
          this.fieldUf.options
        )
        break

      default:
        break
    }
  }

  private carregarUfs() {
    this.dominioService.obterPorTipo('uf').subscribe((result) => {
      result.valorDominio.sort((a, b) => a.valor.localeCompare(b.valor)).forEach((uf) => {
        this.fieldUf.options.push(<FieldOption>{
          value: uf.valor,
          label: uf.valor,
        })
      })

    })
  }

  private selectAllOptions(
    control: FormControl,
    selected: boolean,
    options: FieldOption[]
  ) {
    if (selected) {
      control.patchValue([...options.map((item) => item.value), 'selectAll'])
      return
    }

    control.patchValue([])
  }
}
