import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { DominioService } from '../../../crm/services/dominio.service';
import { EmpresasService } from '../../../crm/services/empresas.service';
import { FiltroAprovacaoCancelamentoNota } from '../../core/models/gestao-aprovacoes/filtro-aprovacao-cancelamento-nota.model';
import { FiltroAprovacaoCestaServico } from '../../core/models/gestao-aprovacoes/filtro-aprovacao-cesta-servico.model';

@Component({
  selector: 'app-gestao-aprovacoes',
  templateUrl: './gestao-aprovacoes.component.html',
  styleUrls: ['./gestao-aprovacoes.component.scss']
})
export class GestaoAprovacoesComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;
  activeIndex: number = 0;

  filterOptionEmpresa: FieldOption[] = [];
  filterOptionUf: FieldOption[] = [];

  filtroCancelamentoNotas: FiltroAprovacaoCancelamentoNota;
  filtroAprovacaoCesta: FiltroAprovacaoCestaServico;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private empresaService: EmpresasService,
    private dominioService: DominioService) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) {
        if (val['url'].includes('gestao-aprovacoes')) {
          this.gerenciarPermissoes();
        }
      }
    });
  }

  ngOnInit(): void {
    this.carregarUfsLicenciamento();
    this.carregarEmpresasSemFiltro();
  }

  onTabChange(event: any) {
    this.activeIndex = event.index;

    this.onChangeTab();
  }

  private gerenciarPermissoes() {
    let tab = this.activatedRoute.snapshot.queryParams?.tab || 'nota';
    let index = this.retornaTabPorTexto(tab);

    if (index == 0) {
      if (!Utility.getPermission([Permissoes.GESTAO_FINANCEIRO_APROVAR_CANCELAMENTO_NF_ND])) {
        tab = 'cesta';
        this.activeIndex = 1;
      }
      else { this.activeIndex = index; }
    }

    if (index == 1) {
      if (!Utility.getPermission([Permissoes.GESTAO_FINANCEIRO_APROVACAO_PRECO_TECNOBANK])) {
        tab = 'nota';
        this.activeIndex = 0;
      }
      else { this.activeIndex = index; }
    }

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge'
    });
  }

  private carregarEmpresasSemFiltro() {
    this.empresaService.obterEmpresasFiltro(0, 10).subscribe(
      (response) => {
        if (response.isSuccessful) {
          let options = [];
          response.empresas.forEach((empresa) => {
            options.push(<FieldOption>{
              value: empresa.id,
              label: Utility.getClienteNomeCnpjRazaoSocial(empresa),
            });
          });

          this.filterOptionEmpresa = options;
        }

        response.errors.forEach((error) => {
          console.info(`${error.code}-${error.message}`);
        });
      },
      (error) => console.info(error)
    );
  }

  private carregarUfsLicenciamento() {
    this.dominioService.obterPorTipo('UF_DETRAN').subscribe((result) => {
      result.valorDominio.forEach((uf) => {
        this.filterOptionUf.push(<FieldOption>{
          value: uf.valor,
          label: uf.valor,
        });
      });
    });
  }

  private onChangeTab() {
    const queryParams: Params = { tab: this.retornaTabPorIndex(this.activeIndex) };
    this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: queryParams });
  }

  private retornaTabPorIndex(index: number) {
    switch (index) {
      case 0: return 'nota';
      case 1: return 'cesta';
    }
  }

  private retornaTabPorTexto(index: string) {
    switch (index) {
      case 'nota': return 0;
      case 'cesta': return 1;
    }
  }
}
