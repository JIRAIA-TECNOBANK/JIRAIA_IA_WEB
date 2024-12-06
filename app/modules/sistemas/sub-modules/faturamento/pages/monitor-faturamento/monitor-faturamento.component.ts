import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { Utility } from 'src/app/core/common/utility';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { DominioService } from '../../../crm/services/dominio.service';
import { EmpresasService } from '../../../crm/services/empresas.service';
import { FiltroConciliacao } from '../../core/models/faturamento-conciliado/filtro-conciliacao.model';
import { FiltroFaturado } from '../../core/models/faturamento-conciliado/filtro-faturado.model';
import { FiltroPendencias } from '../../core/models/faturamento-conciliado/filtro-pendencias.mode';

@Component({
  selector: 'app-monitor-faturamento',
  templateUrl: './monitor-faturamento.component.html',
  styleUrls: ['./monitor-faturamento.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MonitorFaturamentoComponent implements OnInit {

  utility = Utility;
  atualizaGrids: boolean = false;
  activeIndex: number = 1;

  filterOptionUf: FieldOption[] = [];
  filterOptionEmpresa: FieldOption[] = [];
  filterOptionStatusConciliacao: FieldOption[] = [];
  filterOptionStatusFaturar: FieldOption[] = [];

  filtroPendencias: FiltroPendencias = null;
  filtroConciliacao: FiltroConciliacao = null;
  filtroFaturar: FiltroConciliacao = null;
  filtroFaturado: FiltroFaturado = null;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private dominioService: DominioService,
    private empresaService: EmpresasService) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) {
        if (this.activatedRoute.snapshot.queryParams?.tab) {
          this.activeIndex = this.retornaTabPorTexto(this.activatedRoute.snapshot.queryParams?.tab);
        }
      }
    });
  }

  ngOnInit(): void {
    this.carregarUfsLicenciamento();
    this.carregarEmpresasSemFiltro();
    this.carregarStatus();
  }

  atualizarPagina() {
    this.atualizaGrids = !this.atualizaGrids;
  }

  onTabChange(event: any) {
    this.activeIndex = event.index;

    this.onChangeTab();
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

  private carregarStatus() {
    this.filterOptionStatusConciliacao = [
      <FieldOption>{ label: 'Conciliado', value: 1 },
      <FieldOption>{ label: 'Não conciliado', value: 2 },
      <FieldOption>{ label: 'Aguardando revisão', value: 3 }
    ];

    this.filterOptionStatusFaturar = [
      <FieldOption>{ label: 'Conciliado', value: 1 },
      <FieldOption>{ label: 'Não conciliado', value: 2 }
    ];
  }

  consultarDetran() {
    this.router.navigate([`/monitor-faturamento/consultar-detran`]);
  }

  private onChangeTab() {
    const queryParams: Params = { tab: this.retornaTabPorIndex(this.activeIndex) };
    this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: queryParams });
  }

  private retornaTabPorIndex(index: number) {
    switch (index) {
      case 0: return 'pendencias';
      case 1: return 'conciliacao';
      case 2: return 'faturar';
      case 3: return 'faturado';
      case 4: return 'detran';
    }
  }

  private retornaTabPorTexto(index: string) {
    switch (index) {
      case 'pendencias': return 0;
      case 'conciliacao': return 1;
      case 'faturar': return 2;
      case 'faturado': return 3;
      case 'detran': return 4;
    }
  }

}
