import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from 'src/app/shared/services/breadcrumb.service';
import { FaturamentoConciliadoService } from '../../../../services/faturamento-conciliado.service';

@Component({
  selector: 'app-detalhar-pendencias',
  templateUrl: './detalhar-pendencias.component.html',
  styleUrls: ['./detalhar-pendencias.component.scss']
})
export class DetalharPendenciasComponent {

  constructor(private breadcrumbService: BreadcrumbService,
    private activatedRoute: ActivatedRoute,
    private faturamentoConciliadoService: FaturamentoConciliadoService) {
    this.conciliacaoId = this.activatedRoute.snapshot.params['conciliacaoId'];
  }

  empresaNome: string = null;
  uf: string = null;
  conciliacaoId: number;

  ngOnInit() {
    this.faturamentoConciliadoService.dadosPendencia$.subscribe(d => {
      this.empresaNome = d.empresa;
      this.uf = d.uf;
    });
  }

  ngAfterViewInit() {
    this.breadcrumbService.carregarPaginaTitulo(`Detalhar pendências ${this.empresaNome}`);
  }
}
