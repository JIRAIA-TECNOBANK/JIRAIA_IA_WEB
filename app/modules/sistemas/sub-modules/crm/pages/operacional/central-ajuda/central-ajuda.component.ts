import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { Router, NavigationEnd } from '@angular/router';
import { MatLegacyTabGroup as MatTabGroup } from '@angular/material/legacy-tabs';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FormControl } from '@angular/forms';
import { CentralAjudaService } from '../../../services/central-ajuda.service';
import { UsuariosService } from '../../../../admin/services/usuarios.service';
import { SecoesFiltro } from '../../../core/models/central-ajuda/secoes-filtro';
import { UsuariosFiltro } from '../../../../admin/core/models/usuarios/usuarios-filtro.model';
import { ArtigosFiltro } from '../../../core/models/central-ajuda/artigos-filtro';
import { StatusArtigo } from '../../../core/enums/tipo-status-artigo.enum';

@Component({
  selector: 'app-central-ajuda',
  templateUrl: './central-ajuda.component.html',
  styleUrls: ['./central-ajuda.component.scss']
})
export class CentralAjudaComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  constructor(private router: Router, private usuariosService: UsuariosService, private centralAjudaService: CentralAjudaService) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) {
        this.childstate = val['url']?.includes('incluir') || val['url']?.includes('editar');
        if (!this.childstate) {
          this.atualizarGrid = !this.atualizarGrid;
          this.activeIndex = 0;
        }
      }
    })
  }

  @ViewChildren('childTabs') childTabs: QueryList<MatTabGroup>;

  childstate: boolean = false;
  atualizarGrid: boolean = false;
  activeIndex: number = 0;

  //#region Filtro secao

  showRedefinirSecaoBtn: boolean = false;
  filtroSecao: SecoesFiltro = null;

  usuarioSecaoField =
    <FilterField>{
      id: 'usuarioGuid',
      titulo: 'Por usuário',
      tipo: TipoFilterField.Checkbox,
      options: [],
      searchInput: true,
      showTooltip: true
    };

  secaoField =
    <FilterField>{
      id: 'secaoId',
      titulo: 'Por seção',
      tipo: TipoFilterField.Checkbox,
      options: [],
      searchInput: true,
      showTooltip: true
    };

  statusSecaoField =
    <FilterField>{
      id: 'status',
      titulo: 'Por status',
      tipo: TipoFilterField.Checkbox,
      selectAllOptions: 'Todos',
      options: [
        <FieldOption>{ value: 1, label: 'Publicados' },
        <FieldOption>{ value: 2, label: 'Arquivados' },
      ],
    };

  usuariosSecaoControl: FormControl;
  usuariosSecaoSearchControl: FormControl;
  secaoControl: FormControl;
  secaoSearchControl: FormControl;
  statusSecaoControl: FormControl;

  filterSecoes: GridFilter = <GridFilter>{
    id: 'secoes',
    customFields: false,
    fields: [
      this.usuarioSecaoField,
      this.secaoField,
      this.statusSecaoField
    ]
  };

  //#endregion

  //#region Filtro artigo

  showRedefinirArtigoBtn: boolean = false;
  filtroArtigo: SecoesFiltro = null;

  usuarioArtigoField =
    <FilterField>{
      id: 'usuarios',
      titulo: 'Por usuário',
      tipo: TipoFilterField.Checkbox,
      options: [],
      searchInput: true,
    };

  secaoArtigoField =
    <FilterField>{
      id: 'artigoSecaoId',
      titulo: 'Por seção',
      tipo: TipoFilterField.Checkbox,
      options: [],
      searchInput: true,
      showTooltip: true
    };

  artigoField =
    <FilterField>{
      id: 'artigoId',
      titulo: 'Por título do artigo',
      tipo: TipoFilterField.Checkbox,
      options: [],
      searchInput: true,
      showTooltip: true
    };

  statusArtigoField =
    <FilterField>{
      id: 'statusArtigos',
      titulo: 'Por status',
      tipo: TipoFilterField.Checkbox,
      selectAllOptions: 'Todos',
      options: [
        <FieldOption>{ value: StatusArtigo.Publicado, label: 'Publicados' },
        <FieldOption>{ value: StatusArtigo.Rascunho, label: 'Rascunhos' },
        <FieldOption>{ value: StatusArtigo.Arquivado, label: 'Arquivados' }
      ],
    };

  usuariosArtigoControl: FormControl;
  usuariosArtigoSearchControl: FormControl;
  secaoArtigoControl: FormControl;
  secaoArtigoSearchControl: FormControl;
  artigoControl: FormControl;
  artigoSearchControl: FormControl;
  statusArtigoControl: FormControl;

  filterArtigos: GridFilter = <GridFilter>{
    id: 'artigos',
    customFields: false,
    fields: [
      this.usuarioArtigoField,
      this.secaoArtigoField,
      this.artigoField,
      this.statusArtigoField
    ]
  };

  //#endregion

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (!this.childstate) {
      this.atualizarGrid = !this.atualizarGrid;
    }
  }

  onTabChange(event: any) {
    this.activeIndex = event.index;

    this.childTabs.forEach((childTab) => {
      childTab.realignInkBar();
    });
  }

  incluirSecao() {
    this.childstate = true;
    this.router.navigate([`/central-ajuda/incluir-secao`]);
  }

  incluirArtigo() {
    this.childstate = true;
    this.router.navigate([`/central-ajuda/incluir-artigo`]);
  }

  searchSecoes(event) {
    this.filtroSecao = <SecoesFiltro>{
      usuarioGuid: event.get(this.usuarioSecaoField.id),
      secaoId: event.get(this.secaoField.id),
      status: event.get(this.statusSecaoField.id)
    }

    this.showRedefinirSecaoBtn = true;
  }

  searchArtigos(event) {
    this.filtroArtigo = <ArtigosFiltro>{
      artigoId: event.get(this.artigoField.id),
      usuarios: event.get(this.usuarioArtigoField.id),
      secaoId: event.get(this.secaoArtigoField.id),
      statusArtigos: event.get(this.statusArtigoField.id)
    }

    this.showRedefinirArtigoBtn = true;
  }

  redefinirSecoes() {
    this.filtroSecao = null;
    this.showRedefinirSecaoBtn = false;
    this.atualizarGrid = !this.atualizarGrid;
  }

  redefinirArtigos() {
    this.filtroArtigo = null;
    this.showRedefinirArtigoBtn = false;
    this.atualizarGrid = !this.atualizarGrid;
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  carregarSecoes(secao: string = null, field: FilterField) {
    if (this.childstate) return;

    let filtro: SecoesFiltro = <SecoesFiltro>{ pageIndex: 0, pageSize: 10 };
    if (secao) { filtro.secao = secao; }

    this.centralAjudaService.obterSecoesPaginado(filtro).subscribe(
      (response) => {
        if (response.isSuccessful) {
          let options = [];
          
          response.listaSecao.forEach(s => {
            options.push(<FieldOption>{
              value: s.id,
              label: s.titulo,
            });
          });

          field.options = options;
        }

        response.errors.forEach((error) => {
          console.info(`${error.code}-${error.message}`);
        });
      },
      (error) => console.info(error)
    );
  }

  carregarArtigos(artigo: string = null, field: FilterField) {
    if (this.childstate) return;

    let filtro: ArtigosFiltro = <ArtigosFiltro>{ pageIndex: 0, pageSize: 10 };
    if (artigo) { filtro.titulo = artigo; }

    this.centralAjudaService.obterArtigosPaginado(filtro).subscribe(
      (response) => {
        if (response.isSuccessful) {
          let options = [];

          response.listaArtigos.forEach(s => {
            options.push(<FieldOption>{
              value: s.id,
              label: s.titulo,
            });
          });

          field.options = options;
        }

        response.errors.forEach((error) => {
          console.info(`${error.code}-${error.message}`);
        });
      },
      (error) => console.info(error)
    );
  }

  searchField(event) {
    let filtroUsuario = new UsuariosFiltro();
    let valor = Utility.checkNumbersOnly(event.value);

    switch (event.label) {
      case this.secaoField.id:
        this.carregarSecoes(event.value, this.secaoField);
        return;

      case this.usuarioSecaoField.id:
        if (valor) filtroUsuario.nome = valor;
        this.carregarUsuariosFiltro(this.usuarioSecaoField, filtroUsuario);
        return;

      case this.artigoField.id:
        this.carregarArtigos(event.value, this.artigoField);
        return;

      case this.secaoArtigoField.id:
        this.carregarSecoes(event.value, this.secaoArtigoField);

      case this.usuarioArtigoField.id:
        if (valor) filtroUsuario.nome = valor;
        this.carregarUsuariosFiltro(this.usuarioArtigoField, filtroUsuario);
        return;
    }
  }

  private getUsuarioFiltro(pageIndex: number = 0, pageSize: number = 10, filtros: UsuariosFiltro = null) {
    let filtro = <UsuariosFiltro>{
      nome: '',
      documento: '',
      email: filtros != null ? (filtros.email != null ? filtros.email : '') : '',
      ativo: true,
      pageIndex: pageIndex,
      pageSize: pageSize
    }

    return filtro;
  }

  private carregarUsuariosFiltro(field: FilterField, filtro: UsuariosFiltro = null) {
    let sort = 'primeiroNome.asc';

    filtro.pageIndex = 0;
    filtro.pageSize = 10;

    this.usuariosService.obterUsuarios(filtro, sort).subscribe(response => {
      let options = [];

      response.usuarios.forEach(usuario => {
        let label = `${usuario.primeiroNome} ${usuario.sobrenome} - ${usuario.email}`;

        options.push(<FieldOption>{
          label: label,
          value: usuario.usuarioGuid
        });
      });

      field.options = options;
    })
  }
}

