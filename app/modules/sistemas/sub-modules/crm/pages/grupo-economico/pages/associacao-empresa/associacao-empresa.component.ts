import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { Documento } from 'src/app/modules/sistemas/core/models/documento.model';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FilterFieldReturn } from 'src/app/shared/core/models/grid-filter/filter-field-return.model';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { EmpresasFiltro } from '../../../../core/models/empresas/empresas-filtro.model';
import { UsuarioEmpresaGrupoEconomico } from '../../../../core/models/usuarios-empresa/usuario-empresa-grupo-economico.model';
import { UsuariosConvidadosFiltro } from '../../../../core/models/usuarios-empresa/usuarios-convidados-filtro';
import { GruposEconomicosService } from '../../../../services/grupos-economicos.service';
import { Permissoes } from '../../../../../../../../core/common/permissoes';
import { UsuariosEmpresaService } from '../../../../services/usuarios-empresa.service';

@Component({
  selector: 'app-associacao-empresa',
  templateUrl: './associacao-empresa.component.html',
  styleUrls: ['./associacao-empresa.component.scss']
})
export class AssociacaoEmpresaComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  constructor(private activatedRoute: ActivatedRoute,
    private router: Router,
    private gruposEconomicosService: GruposEconomicosService,
    private usuariosService: UsuariosEmpresaService) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) {
        if (!val['url'].includes('convidar-usuario')) {
          this.refreshUsuarioConvidadoGrid = !this.refreshUsuarioConvidadoGrid;
        }
      }
    });
  }

  @Input() grupoEconomicoId: number = null;

  tabNumber: number = Utility.getPermission([Permissoes.GESTAO_EMPRESA_GRUPO_ECONOMICO_CADASTRAR]) ? 0 : 1;
  filterActive: boolean = false;
  atualizarDisponiveis: boolean = false;
  atualizarIncluidas: boolean = false;

  showRedefinirUsuarioConvidadoBtn: boolean = false;
  refreshUsuarioConvidadoGrid: boolean = false;

  //#region Filtro Usuarios Convidados
  filterOptionPerfil: FieldOption[] = [];
  listPerfilOptionsSelected: FieldOption[] = [];
  filterOptionEmpresa: FieldOption[] = [];
  listEmpresaOptionsSelected: FieldOption[] = [];

  nomeUsuarioControl: FormControl;
  cpfUsuarioControl: FormControl;
  empresaControl: FormControl;
  empresaSearchControl: FormControl;
  tipoUsuarioControl: FormControl;
  emailConvidadoControl: FormControl;
  emailConvidadoSearchControl: FormControl;

  filtroUsuarioConvidado: UsuariosConvidadosFiltro = null;
  fieldNomeConvidado: FilterField = <FilterField>{ id: 'nomeUsuarioConvidado', titulo: 'Por nome', tipo: TipoFilterField.Text, validators: Validators.minLength(3) };
  fieldEmailConvidado: FilterField = <FilterField>{
    id: 'email',
    titulo: 'Por e-mail',
    tipo: TipoFilterField.Checkbox,
    options: [],
    searchInput: true,
    showTooltip: true
  };
  fieldEmpresaConvidado: FilterField = <FilterField>{ id: 'empresaId', titulo: 'Por empresa', tipo: TipoFilterField.Checkbox, options: this.filterOptionEmpresa, searchInput: true };
  fieldTipoConvidado: FilterField = <FilterField>{
    id: 'tipoExterno',
    titulo: 'Por tipo de usuário',
    tipo: TipoFilterField.Checkbox,
    selectAllOptions: 'Todos',
    options: [
      <FieldOption>{ value: true, label: 'Usuário externo' },
      <FieldOption>{ value: false, label: 'Usuário interno' },
    ],
  };
  filterConvidado: GridFilter;

  redefinirField: boolean = false;;
  dadosOpen: boolean = true;


  //#endregion

  //#region Disponiveis

  filtroDisponiveis: EmpresasFiltro;
  fieldNomeDisponiveis: FilterField = <FilterField>{ id: 'nome', titulo: 'Por nome', tipo: TipoFilterField.Text, validators: Validators.compose([Validators.minLength(3), Validators.maxLength(21)]) }

  filterDisponiveis: GridFilter = <GridFilter>{
    id: 'empresas-disponiveis',
    customFields: false,
    fields: [this.fieldNomeDisponiveis]
  }

  showRedefinirDisponiveisBtn: boolean = false;
  refreshDisponiveisGrid: boolean = false;

  //#endregion

  //#region Incluidas

  filtroIncluidas: EmpresasFiltro;
  fieldNomeIncluidas: FilterField = <FilterField>{ id: 'nome', titulo: 'Por nome', tipo: TipoFilterField.Text, validators: Validators.compose([Validators.minLength(3), Validators.maxLength(21)]) }

  filterIncluidas: GridFilter = <GridFilter>{
    id: 'empresas-incluidas',
    customFields: false,
    fields: [this.fieldNomeIncluidas]
  }

  showRedefinirIncluidasBtn: boolean = false;
  refreshIncluidasGrid: boolean = false;

  //#endregion

  ngOnInit(): void {
    this.carregarEmpresasFiltro();

    this.filterConvidado = <GridFilter>{
      id: 'usuarios-convidados',
      customFields: true,
      fields: [
        this.fieldNomeConvidado,
        this.fieldEmailConvidado,
        this.fieldEmpresaConvidado,
        this.fieldTipoConvidado
      ]
    };
  }

  changeTab(tab: any) {
    this.tabNumber = tab.index;
  }

  atualizarGrid(disponiveis: boolean) {
    this.atualizarDisponiveis = false;
    this.atualizarIncluidas = false;

    Utility.waitFor(() => {
      if (disponiveis) {
        this.atualizarDisponiveis = true;
        return;
      }

      this.atualizarIncluidas = true;
    }, 3000);
  }

  searchDisponiveis(event) {
    this.filtroDisponiveis = <EmpresasFiltro>{
      nome: event.get(this.fieldNomeDisponiveis.id)
    }

    this.showRedefinirDisponiveisBtn = true;
  }

  redefinirDisponiveis() {
    this.filtroDisponiveis = null;
    this.refreshDisponiveisGrid = !this.refreshDisponiveisGrid;
    this.showRedefinirDisponiveisBtn = false;
  }

  searchIncluidas(event) {
    this.filtroIncluidas = <EmpresasFiltro>{
      nome: event.get(this.fieldNomeIncluidas.id)
    }

    this.showRedefinirIncluidasBtn = true;
  }

  redefinirIncluidas() {
    this.filtroIncluidas = null;
    this.refreshIncluidasGrid = !this.refreshIncluidasGrid;
    this.showRedefinirIncluidasBtn = false;
  }

  goBack() {
    this.router.navigate(['..'], { relativeTo: this.activatedRoute });
  }

  goTo(params: string) {
    this.router.navigate([`${params}`], { relativeTo: this.activatedRoute });
  }

  convidarUsuario() {
    if (this.activatedRoute.snapshot.params['grupoEconomicoId']) {
      this.goTo('convidar-usuario');
      return;
    }

    this.goTo(`../atualizar-grupo/${this.grupoEconomicoId}/convidar-usuario`);
    return;
  }

  redefinirFiltroConvidado() {
    this.filtroUsuarioConvidado = null;
    this.refreshUsuarioConvidadoGrid = !this.refreshUsuarioConvidadoGrid;
    this.showRedefinirUsuarioConvidadoBtn = false;
    this.redefinirField = !this.redefinirField;
  }

  searchConvidados(event) {
    this.filtroUsuarioConvidado = <UsuariosConvidadosFiltro>{
      nome: event.get("nomeUsuarioConvidado"),
      empresaId: event.get("empresaId"),
      usuarioIdConvidado: event.get('email')
    }

    if (event.get('tipoExterno')?.length == 1) { this.filtroUsuarioConvidado.tipoExterno = event.get('tipoExterno')[0]; }

    this.showRedefinirUsuarioConvidadoBtn = true;
  }

  setCustomControls(event: Map<string, AbstractControl>) {
    this.nomeUsuarioControl = event.get(this.fieldNomeConvidado.id) as FormControl;
    this.emailConvidadoControl = event.get(this.fieldEmailConvidado.id) as FormControl;
    this.emailConvidadoSearchControl = event.get(this.fieldEmailConvidado.id + "_search") as FormControl;
    this.empresaControl = event.get(this.fieldEmpresaConvidado.id) as FormControl;
    this.empresaSearchControl = event.get(this.fieldEmpresaConvidado.id + "_search") as FormControl;
    this.tipoUsuarioControl = event.get(this.fieldTipoConvidado.id) as FormControl;
  }

  searchFilter(event: FieldOption) {
    if (event.label == 'empresaId') {
      let filtro = Utility.checkNumbersOnly(event.value);
      this.carregarEmpresasFiltro(filtro);
    }

    if (event.label == 'email') {
      let filtro = event.value;
      this.carregarEmailConvidados(filtro);
    }
  }

  onChangeSearch(value: string, reset?: boolean) {
    if (reset || value == '') {
      this.searchFilter(<FieldOption>{ label: this.fieldEmpresaConvidado.id, value: '' });
      if (reset) {
        this.listEmpresaOptionsSelected = [];
        return
      }

      this.updateOptions();
      return;
    }

    if (value.length >= 3) {
      this.searchFilter(<FieldOption>{ label: this.fieldEmpresaConvidado.id, value: value });
      this.updateOptions();
    }
  }

  updateOptions() {
    Utility.waitFor(() => {
      this.listEmpresaOptionsSelected.forEach(selected => {
        let option = this.fieldEmpresaConvidado.options.filter(op => op.value == selected.value)[0];
        if (option) {
          this.fieldEmpresaConvidado.options.splice(this.fieldEmpresaConvidado.options.indexOf(option), 1);
        }
      });
    }, 1000);
  }

  setControlValue() {
    let options = [];
    this.listEmpresaOptionsSelected.forEach(op => { options.push(op.value); });
    this.empresaControl.patchValue(options);

    this.listEmpresaOptionsSelected.forEach(selected => {
      let option = this.fieldEmpresaConvidado.options.filter(op => op.value == selected.value)[0];
      if (option) {
        this.fieldEmpresaConvidado.options.splice(this.fieldEmpresaConvidado.options.indexOf(option), 1);
      }
    });
  }

  toggleOption(option) {
    if (!this.fieldEmpresaConvidado.searchInput) return;

    let selected = this.listEmpresaOptionsSelected.filter(o => o.value == option.value)[0];
    if (selected) {
      this.listEmpresaOptionsSelected.splice(this.listEmpresaOptionsSelected.indexOf(selected), 1);
      this.setControlValue();
      return;
    }

    this.listEmpresaOptionsSelected.push(option);
    this.setControlValue();
  }

  selectAll(fieldReturn: FilterFieldReturn) {
    switch (fieldReturn.field.id) {
      case this.fieldEmpresaConvidado.id:
        this.selectAllOptions(this.empresaControl, fieldReturn.selected, this.fieldEmpresaConvidado.options);
        break;

      case this.fieldTipoConvidado.id:
        this.selectAllOptions(this.tipoUsuarioControl, fieldReturn.selected, this.fieldTipoConvidado.options);
        break;
    }
  }

  public getElementId(tipoElemento: TipoElemento, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(tipoElemento, nomeElemento, guidElemento);
  }

  private carregarEmailConvidados(filtro: string = '') {
    const filtroConvidado = <UsuariosConvidadosFiltro>{
      email: filtro
    };

    this.usuariosService.obterUsuariosConvidados(this.grupoEconomicoId, filtroConvidado).subscribe(response => {
      let options = [];
      if (response.usuarios) {
        response.usuarios.forEach(usuario => {
          options.push(<FieldOption>{ value: usuario.id, label: usuario.email });
        });
      }

      this.fieldEmailConvidado.options = options;
    })
  }

  private selectAllOptions(control: FormControl, selected: boolean, options: FieldOption[]) {
    if (selected) {
      control
        .patchValue([...options.map(item => item.value), 'selectAll']);
      return;
    }

    control.patchValue([]);
  }

  private carregarEmpresasFiltro(filtro: string = "") {
    this.gruposEconomicosService.obterEmpresasLista(this.grupoEconomicoId).subscribe(response => {
      let options = [];
      if (response.empresas) {
        var empresas: UsuarioEmpresaGrupoEconomico[] = [];

        if (filtro) {
          if (!isNaN(+filtro)) { // filtro por CNPJ
            empresas = response.empresas.filter(e => e.cnpj.includes(filtro));
          }
          else {
            empresas = response.empresas.filter(e => e.name.toLowerCase().includes(filtro.toLowerCase()));
          }
        }
        else { empresas = response.empresas; }

        empresas.forEach(empresa => {
          options.push(<FieldOption>{ value: empresa.id, label: this.getClienteNomeCnpj(empresa) });
        });
      }

      this.fieldEmpresaConvidado.options = options;
    });
  }

  private getClienteNomeCnpj(cliente: UsuarioEmpresaGrupoEconomico) {
    let cnpj = <Documento>{ numero: cliente.cnpj, tipoDocumento: 2 };
    return `${cliente.name} (${Utility.formatDocument(cnpj)})`
  }
}

