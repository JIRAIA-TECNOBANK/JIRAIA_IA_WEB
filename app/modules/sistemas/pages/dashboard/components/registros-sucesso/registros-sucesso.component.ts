import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { BlocoVazio } from 'src/app/modules/sistemas/core/models/common/bloco-vazio.model';
import { FiltroGraficosComplementares } from 'src/app/modules/sistemas/sub-modules/crm/core/models/dashboard/filtro-graficos-complementares.model';
import { RegistrosPorUF } from 'src/app/modules/sistemas/sub-modules/crm/core/models/dashboard/registros-por-uf.model';
import { DashboardService } from 'src/app/modules/sistemas/sub-modules/crm/services/dashboard.service';
import { SortByPipe } from 'src/app/shared/pipes/sort-by.pipe';

@Component({
  selector: 'app-registros-sucesso',
  templateUrl: './registros-sucesso.component.html',
  styleUrls: ['./registros-sucesso.component.scss']
})
export class RegistrosSucessoComponent {

  @Input('total') total: number = null;
  @Input('filtro') filtro: FiltroGraficosComplementares;

  @Output('mostrarDetalhes') expandido: EventEmitter<boolean> = new EventEmitter<boolean>();

  utility = Utility;
  loading: boolean = true;
  totalFormatado: string = null;
  mostrarDetalhes: boolean = false;
  registrosComSucesso: RegistrosPorUF[] = [];

  sortPipe = new SortByPipe();

  blocoVazio: BlocoVazio = {
    id: 'registros-sucesso',
    titulo: 'Registros com sucesso',
    icone: './../../../../assets/img/custom-icons/icone-vazio-check.svg',
    subtitulo: `Nenhuma operação <br>registrada com sucesso adicionada recentemente.`,
    mensagem: `Continue utilizando a nossa plataforma para <br>ter a melhor experiência em nosso dashboard.`,
  };

  constructor(private dashboardService: DashboardService) { }

  ngOnChanges() {
    this.mostrarDetalhes = false;
    this.expandido.emit(this.mostrarDetalhes);

    if (this.total === null) this.loading = true;
    else if (this.total === 0) {
      this.loading = false;
      this.expandido.emit(true);
    }
    else { this.formatarTotal(this.total); }
  }

  expandirDetalhes() {
    this.mostrarDetalhes = !this.mostrarDetalhes;

    if (this.mostrarDetalhes) {
      this.registrosComSucesso = [];
      
      this.dashboardService.obterRegistrosComSucesso(this.filtro.dataInicio, this.filtro.dataFim).subscribe(response => {
        if (response.registrosComSucessos) {
          let registrosEmOrdem = this.sortPipe.transform(response.registrosComSucessos.filter(r => r.uf), 'asc', 'uf');
          this.registrosComSucesso = registrosEmOrdem;
        }
      });
    }

    this.expandido.emit(this.mostrarDetalhes);
  }

  private formatarTotal(total: number) {
    this.totalFormatado = null;
    if (total !== null) {
      this.loading = false;
      this.totalFormatado = total.toLocaleString();
    }
  }
}
