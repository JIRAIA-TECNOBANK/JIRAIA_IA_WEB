import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { UsuariosFiltro } from '../../../core/models/usuarios/usuarios-filtro.model';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { Utility } from 'src/app/core/common/utility';
import { Permissoes } from 'src/app/core/common/permissoes';
import { UsuariosService } from '../../../services/usuarios.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private usuariosService: UsuariosService) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) {
        this.childstate = val['url']?.includes('incluir') || val['url']?.includes('editar');

        if (!this.childstate && this.init) {
          this.refreshUsuarioGrid = !this.refreshUsuarioGrid;
        }
      }
    });
  }

  childstate: boolean = false;
  init: boolean = false;
  filterActive: boolean = false;
  filtroUsuario: UsuariosFiltro = null;
  atualizarGrid: boolean = false;
  usuarioFilterForm = this.formBuilder.group({
    nome: [null, Validators.minLength(3)],
    email: [null, Validators.minLength(3)]
  });

  showRedefinirUsuarioBtn: boolean = false;
  refreshUsuarioGrid: boolean = false;

  filterOptionUsuariosPeriodo: FieldOption[] = [];

  fieldUsuarioNome: FilterField = <FilterField>{
    id: 'nome',
    titulo: 'Por nome',
    tipo: TipoFilterField.Checkbox,
    options: [],
    searchInput: true,
    showTooltip: true
  };

  fieldUsuarioDocumento: FilterField = <FilterField>{
    id: 'documento',
    titulo: 'Por CPF',
    tipo: TipoFilterField.Checkbox,
    options: [],
    searchInput: true,
    showTooltip: true
  };

  fieldUsuarioEmail: FilterField = <FilterField>{
    id: 'email',
    titulo: 'Por e-mail',
    tipo: TipoFilterField.Checkbox,
    options: [],
    searchInput: true,
    showTooltip: true
  };

  fieldUsuarioStatus: FilterField = <FilterField>{
    id: 'status', titulo: 'Por status', tipo: TipoFilterField.Checkbox, selectAllOptions: 'Todos', options: [
      <FieldOption>{ value: true, label: 'Ativos' },
      <FieldOption>{ value: false, label: 'Inativos' }]
  };

  filterUsuarios: GridFilter = <GridFilter>{
    id: 'empresa-usuarios',
    customFields: false,
    fields: [
      this.fieldUsuarioNome,
      this.fieldUsuarioDocumento,
      this.fieldUsuarioEmail,
      this.fieldUsuarioStatus
    ]
  }

  ngOnInit(): void {
    //
  }

  ngAfterViewInit() {
    this.init = true;
  }

  criarUsuario() {
    this.childstate = true;
    this.router.navigate(['incluir-usuario'], {
      relativeTo: this.activatedRoute,
    });
  }

  redefinirFiltro() {
    this.filtroUsuario = null;
    this.refreshUsuarioGrid = !this.refreshUsuarioGrid;
    this.showRedefinirUsuarioBtn = false;
  }

  search(event) {
    let status: boolean[] = event.get(this.fieldUsuarioStatus.id);
    let usuarioId = [];
    if (event.get(this.fieldUsuarioNome.id) && event.get(this.fieldUsuarioNome.id).length > 0) usuarioId.push(...event.get(this.fieldUsuarioNome.id));
    if (event.get(this.fieldUsuarioDocumento.id) && event.get(this.fieldUsuarioDocumento.id).length > 0) usuarioId.push(...event.get(this.fieldUsuarioDocumento.id));
    if (event.get(this.fieldUsuarioEmail.id) && event.get(this.fieldUsuarioEmail.id).length > 0) usuarioId.push(...event.get(this.fieldUsuarioEmail.id));

    let filtro = new UsuariosFiltro();
    if (status?.length == 1) filtro.ativo = status[0];
    if (usuarioId.length > 0) filtro.usuarioId = usuarioId;
    this.filtroUsuario = filtro;

    this.showRedefinirUsuarioBtn = true;
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(tipoElemento, nomeElemento, guidElemento);
  }

  searchField(event) {
    let filtro = new UsuariosFiltro();
    let valor = Utility.checkNumbersOnly(event.value);

    switch (event.label) {
      case this.fieldUsuarioNome.id:
        if (valor) filtro.nome = valor;
        this.carregarUsuariosFiltro(this.fieldUsuarioNome, filtro);
        return;

      case this.fieldUsuarioDocumento.id:
        if (valor) filtro.documento = valor;
        this.carregarUsuariosFiltro(this.fieldUsuarioDocumento, filtro);
        return;

      case this.fieldUsuarioEmail.id:
        if (valor) filtro.email = event.value;
        this.carregarUsuariosFiltro(this.fieldUsuarioEmail, filtro);
        return;
    }
  }

  private carregarUsuariosFiltro(field: FilterField, filtro: UsuariosFiltro = null) {
    let sort = 'primeiroNome.asc';

    if (field.id == this.fieldUsuarioDocumento.id) sort = 'documento.asc';
    if (field.id == this.fieldUsuarioEmail.id) sort = 'email.asc';

    filtro.pageIndex = 0;
    filtro.pageSize = 10;

    this.usuariosService.obterUsuarios(filtro, sort).subscribe(response => {
      let options = [];

      response.usuarios.forEach(usuario => {
        let label = `${usuario.primeiroNome} ${usuario.sobrenome} - ${usuario.email}`;

        if (field.id == this.fieldUsuarioDocumento.id) { label = `${Utility.formatCpf(usuario.documento)} - ${usuario.primeiroNome} ${usuario.sobrenome}`; }
        if (field.id == this.fieldUsuarioEmail.id) { label = `${usuario.email} - ${usuario.primeiroNome} ${usuario.sobrenome}`; }

        options.push(<FieldOption>{
          label: label,
          value: usuario.id
        });
      });

      field.options = options;
    })
  }

}
