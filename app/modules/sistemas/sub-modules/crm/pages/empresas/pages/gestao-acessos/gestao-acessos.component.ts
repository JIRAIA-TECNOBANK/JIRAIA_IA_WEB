import { Component, OnInit } from '@angular/core';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Utility } from 'src/app/core/common/utility';
import { FORMATO_DATA } from 'src/app/modules/sistemas/core/models/common/formato-date-picker.model';
import { PortalDominioService } from 'src/app/modules/sistemas/sub-modules/admin/services/_portal/portal-dominio.service';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FilterCustomField } from 'src/app/shared/core/models/grid-filter/filter-custom-field.model';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { Permissoes } from '../../../../../../../../core/common/permissoes';
import { PerfisFiltro } from '../../../../core/models/perfis/perfis-filtro.model';
import { UsuarioEmpresaFiltro } from '../../../../core/models/usuarios-empresa/usuario-empresa-filtro.model';
import { DominiosResponse } from '../../../../core/responses/dominios/dominios.response';
import { EmpresasService } from '../../../../services/empresas.service';
import { UsuariosEmpresaService } from '../../../../services/usuarios-empresa.service';

@Component({
  selector: 'app-gestao-acessos',
  templateUrl: './gestao-acessos.component.html',
  styleUrls: ['./gestao-acessos.component.scss'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: FORMATO_DATA },
  ]
})
export class GestaoAcessosComponent implements OnInit {

  childstate: boolean = false;
  tabNumber: number = 0;
  init: boolean = false;
  empresaId: number;
  filterActive: boolean = false;
  filtroPerfil: PerfisFiltro = null;
  filtroUsuario: UsuarioEmpresaFiltro = null;
  hasActivePerfil: boolean;
  refreshPerfilGrid: boolean = false;
  refreshUsuarioGrid: boolean = false;
  refreshUsuarioSrdGrid: boolean = false;

  utility = Utility;
  Permissoes = Permissoes;

  //#region Filtro Perfis

  filterOptionPeriodo: FieldOption[] = [];
  showRedefinirPerfilBtn: boolean = false;

  fieldPerfilNome: FilterField = <FilterField>{
    id: 'PalavraChave',
    titulo: 'Por perfil',
    tipo: TipoFilterField.Checkbox,
    options: [],
    searchInput: true,
    showTooltip: true
  };
  fieldPerfilPeriodo: FilterField = <FilterField>{
    id: 'Periodo', titulo: 'Por período', tipo: TipoFilterField.Period, options: this.filterOptionPeriodo, customFields: [
      <FilterCustomField>{ id: 'De' },
      <FilterCustomField>{ id: 'Ate' }]
  };
  fieldPerfilStatus: FilterField = <FilterField>{
    id: 'areaStatus', titulo: 'Por status', tipo: TipoFilterField.Checkbox, selectAllOptions: 'Todos', options: [
      <FieldOption>{ value: true, label: 'Ativos' },
      <FieldOption>{ value: false, label: 'Inativos' }]
  };

  filter: GridFilter = <GridFilter>{
    id: 'empresa-perfis',
    customFields: false,
    fields: [
      this.fieldPerfilNome,
      this.fieldPerfilPeriodo,
      this.fieldPerfilStatus
    ]
  }
  //#endregion

  //#region Filtro Usuarios

  filterOptionUsuariosPeriodo: FieldOption[] = [];
  showRedefinirUsuarioBtn: boolean = false;

  fieldUsuarioNome: FilterField = <FilterField>{
    id: 'nome',
    titulo: 'Por nome',
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
      this.fieldUsuarioEmail,
      this.fieldUsuarioStatus
    ]
  }
  //#endregion

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private portalDominioService: PortalDominioService,
    private usuarioEmpresaService: UsuariosEmpresaService,
    private empresaService: EmpresasService
  ) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) {
        this.childstate =
          val['url'].split('gestao-acessos')[1]?.includes('criar-usuario') ||
          val['url']
            .split('gestao-acessos')[1]
            ?.includes('atualizar-usuario') ||
          val['url'].split('gestao-acessos')[1]?.includes('criar-perfil') ||
          val['url'].split('gestao-acessos')[1]?.includes('atualizar-perfil');

        if (this.init && !this.childstate) {
          this.refreshPerfilGrid = !this.refreshPerfilGrid;
          this.refreshUsuarioGrid = !this.refreshUsuarioGrid;
          this.refreshUsuarioSrdGrid = !this.refreshUsuarioSrdGrid;
        }
      }
    });

    this.empresaId = +this.activatedRoute.snapshot.params['empresaId'];
    this.tabNumber = Utility.getPermission([Permissoes.GESTAO_EMPRESA_USUARIO_MASTER_CONSULTAR, Permissoes.GESTAO_EMPRESA_USUARIO_CRM_CADASTRAR]) ? 0 : 2;
  }

  changeTab(tab: any) {
    this.tabNumber = tab.index;
  }

  ngOnInit(): void {
    this.carregarPeriodo();
  }

  ngAfterViewInit() {
    this.init = true;
  }

  criarUsuario() {
    this.router.navigate(['criar-usuario'], {
      relativeTo: this.activatedRoute,
    });
  }

  criarUsuarioSrd() {
    this.router.navigate(['criar-usuario-srd'], {
      relativeTo: this.activatedRoute,
    });
  }

  obterUsuarioPorGuid(usuarioGuid: string) {
    this.router.navigate(['atualizar-usuario', usuarioGuid], {
      relativeTo: this.activatedRoute,
    });
  }

  criarPerfil() {
    this.router.navigate(['criar-perfil'], {
      relativeTo: this.activatedRoute,
    });
  }

  obterPerfilPorId(perfilId: number) {
    this.router.navigate(['atualizar-perfil', perfilId], {
      relativeTo: this.activatedRoute
    });
  }

  redefinirFiltroPerfil() {
    this.filtroPerfil = null;
    this.refreshPerfilGrid = !this.refreshPerfilGrid;
    this.showRedefinirPerfilBtn = false;
  }

  redefinirFiltroUsuario() {
    this.filtroUsuario = null;
    this.refreshUsuarioGrid = !this.refreshUsuarioGrid;
    this.showRedefinirUsuarioBtn = false;
  }

  searchPerfil(event) {
    let status = event.get(this.fieldPerfilStatus.id);
    let dataInicial = event.get('De');
    let dataFinal = event.get('Ate');
    let perfilId = event.get(this.fieldPerfilNome.id);

    let filtro = new PerfisFiltro();
    if (status && status.length == 1) filtro.status = status[0];
    if (dataInicial) filtro.de = dataInicial;
    if (dataFinal) filtro.ate = dataFinal;
    if (perfilId?.length > 0) filtro.perfilId = perfilId;
    this.filtroPerfil = filtro;
    
    this.showRedefinirPerfilBtn = true;
  }

  searchUsuario(event) {
    let status = event.get(this.fieldUsuarioStatus.id);
    let usuarioGuid = [];
    if (event.get(this.fieldUsuarioNome.id) && event.get(this.fieldUsuarioNome.id).length > 0) usuarioGuid.push(...event.get(this.fieldUsuarioNome.id));
    if (event.get(this.fieldUsuarioEmail.id) && event.get(this.fieldUsuarioEmail.id).length > 0) usuarioGuid.push(...event.get(this.fieldUsuarioEmail.id));

    let filtro = new UsuarioEmpresaFiltro();
    if (status && status.length == 1) filtro.status = status[0];
    if (usuarioGuid.length > 0) filtro.usuarioGuid = usuarioGuid;
    this.filtroUsuario = filtro;

    this.showRedefinirUsuarioBtn = true;
  }

  searchField(event) {
    let filtro = new UsuarioEmpresaFiltro();

    switch (event.label) {
      case this.fieldUsuarioNome.id:
        filtro.nome = event.value;
        this.carregarUsuariosFiltro(this.fieldUsuarioNome, filtro);
        return;

      case this.fieldUsuarioEmail.id:
        filtro.email = event.value;
        this.carregarUsuariosFiltro(this.fieldUsuarioEmail, filtro);
        return;
    }
  }

  searchFieldPerfil(event) {
    let filtro = new PerfisFiltro();

    if (event.value) filtro.palavraChave = event.value;
    filtro.pageIndex = 0;
    filtro.pageSize = 10;
    this.carregarPerfisFiltro(filtro);
  }

  private carregarPeriodo() {
    this.portalDominioService.obterPorTipo('PERIODO')
      .subscribe((response: DominiosResponse) => {
        if (response.isSuccessful) {
          response.valorDominio.forEach(periodo => { this.filterOptionPeriodo.push(<FieldOption>{ value: periodo.palavraChave, label: periodo.valor }); });
        }

        response.errors.forEach((error) => {
          console.info(`${error.code}-${error.message}`)
        })
      },
        error => console.info(error)
      )
  }

  private carregarUsuariosFiltro(field: FilterField, filtro: UsuarioEmpresaFiltro = null) {
    let sort = 'primeiroNome.asc';

    if (field.id == this.fieldUsuarioEmail.id) sort = 'email.asc';

    this.usuarioEmpresaService.obterUsuarios(this.empresaId, 0, 10, sort, filtro).subscribe(response => {
      let options = [];

      response.usuarios.forEach(usuario => {
        let label = `${usuario.nomeCompleto} - ${usuario.email}`;

        if (field.id == this.fieldUsuarioEmail.id) { label = `${usuario.email} - ${usuario.nomeCompleto}`; }

        options.push(<FieldOption>{
          label: label,
          value: usuario.usuarioGuid
        });
      });

      field.options = options;
    })
  }

  private carregarPerfisFiltro(filtro: PerfisFiltro = null) {
    this.empresaService.obterPerfis(this.empresaId, filtro).subscribe(response => {
      let options = [];

      response.perfis.forEach(perfil => {
        options.push(<FieldOption>{
          label: perfil.nome,
          value: perfil.id
        });
      });

      this.fieldPerfilNome.options = options;
    });
  }
}
