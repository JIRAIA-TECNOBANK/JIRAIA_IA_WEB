import { Component, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from 'src/app/core/auth/auth.service';
import { PermissoesRotas } from 'src/app/core/common/permissoes-rotas';
import { PermissoesSistema } from 'src/app/core/common/permissoes-sistema';
import { Utility } from 'src/app/core/common/utility';
import { Usuario } from 'src/app/core/models/usuarios/usuario.model';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { BreadcrumbService } from 'src/app/shared/services/breadcrumb.service';
import { closePreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { FiltroGraficosComplementares } from '../../sub-modules/crm/core/models/dashboard/filtro-graficos-complementares.model';
import { ResumoRegistrosFiltro } from '../../sub-modules/crm/core/models/dashboard/resumo-registros-filtro.model';
import { DialogAcessoNegadoComponent } from './components/dialog-acesso-negado/dialog-acesso-negado.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private breadcrumbService: BreadcrumbService,
    private authService: AuthService,
    private store: Store<{ preloader: IPreloaderState }>) { }

  utility = Utility;

  refresh: boolean = false;
  filtroGraficosComplementares: FiltroGraficosComplementares;
  linhaGrafico: string = null;
  filtrosResumo: ResumoRegistrosFiltro;
  consultaMonitorOperacoes: 'success' | 'warning' | 'danger';

  totalRegistrosSucesso: number = null;
  totalRegistrosInconsistencia: number = null;

  sucessoExpandido: boolean = false;
  inconsistenciasExpandido: boolean = false;

  topEmpresasExpandido: boolean = false;
  topInconsistenciasExpandido: boolean = false;

  ngOnInit(): void {
    this.obterTitulo();
  }

  ngAfterViewInit() {
    this.store.dispatch(closePreloader());
  }

  onClickAtalho(atalho: string, params: string = null) {
    let acessoNegado = false;

    switch (atalho) {
      case 'organizacoes':
        if (!Utility.verificaPermissaoRota(PermissoesRotas.GESTAO_EMPRESAS_GRUPOS)) { acessoNegado = true; }
        break;

      case 'usuarios':
        if (!Utility.verificaPermissaoRota(PermissoesRotas.ACESSOS_USUARIO_INTERNO)) { acessoNegado = true; }
        break;

      case 'monitor-operacoes-lotes':
        if (!Utility.verificaPermissaoRota(PermissoesRotas.MONITOR_OPERACOES_LOTES)) { acessoNegado = true; }
        break;

      case 'notificacoes':
        if (!Utility.verificaPermissaoRota(PermissoesRotas.NOTIFICACOES)) { acessoNegado = true; }
        break;

      case 'central-ajuda':
        if (!Utility.verificaPermissaoRota(PermissoesRotas.CENTRAL_AJUDA)) { acessoNegado = true; }
        break;
    }

    if (acessoNegado) {
      this.dialog.open(DialogCustomComponent, {
        width: '500px',
        data: {
          component: DialogAcessoNegadoComponent,
          buttonCancel: {
            value: false,
            text: '',
          },
          buttonConfirm: {
            value: true,
            text: 'Entendi',
          },
          showActionButtons: false
        },
      });
      return;
    }

    this.router.navigate([atalho], { relativeTo: this.activatedRoute, queryParams: { tab: params } });
  }

  obterTitulo() {
    if (PermissoesSistema.retornarNomeUsuario) {
      this.breadcrumbService.carregarPaginaTitulo(`Olá${PermissoesSistema.retornarNomeUsuario !== null ? ', ' + PermissoesSistema.retornarNomeUsuario : ''}`);
      return;
    }

    this.authService.obterUsuarioAtual()
      .then((usuario: Usuario) => {
        PermissoesSistema.setarNomeUsuario(usuario.nome.nomeCompleto);
        this.breadcrumbService.carregarPaginaTitulo(`Olá, ${PermissoesSistema.retornarNomeUsuario}`);
      })
  }

  atualizarPagina() {
    this.refresh = !this.refresh;
  }

  filtrarGraficosComplementares(event: FiltroGraficosComplementares) {
    this.filtroGraficosComplementares = event;
  }

  mostrarLinhaGrafico(tipo: 'success' | 'warning' | 'danger') {
    this.linhaGrafico = tipo;
  }

  carregarFiltrosResumo(filtros: ResumoRegistrosFiltro) {
    this.filtrosResumo = filtros;
  }

  consultarMonitorOperacoes(tipo: 'success' | 'warning' | 'danger') {
    this.consultaMonitorOperacoes = tipo;
  }

}
