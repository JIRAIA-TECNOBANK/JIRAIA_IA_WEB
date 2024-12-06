import { Component, EventEmitter, Input, Output } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Utility } from 'src/app/core/common/utility';
import { BlocoVazio } from 'src/app/modules/sistemas/core/models/common/bloco-vazio.model';
import { FiltroGraficosComplementares } from 'src/app/modules/sistemas/sub-modules/crm/core/models/dashboard/filtro-graficos-complementares.model';
import { RegistrosPorUF } from 'src/app/modules/sistemas/sub-modules/crm/core/models/dashboard/registros-por-uf.model';
import { DashboardService } from 'src/app/modules/sistemas/sub-modules/crm/services/dashboard.service';
import { SortByPipe } from 'src/app/shared/pipes/sort-by.pipe';

@Component({
  selector: 'app-registros-inconsistencia',
  templateUrl: './registros-inconsistencia.component.html',
  styleUrls: ['./registros-inconsistencia.component.scss']
})
export class RegistrosInconsistenciaComponent {

  @Input('total') total: number = null;
  @Input('filtro') filtro: FiltroGraficosComplementares;

  @Output('mostrarDetalhes') expandido: EventEmitter<boolean> = new EventEmitter<boolean>();

  utility = Utility;
  loading: boolean = true;
  totalFormatado: string = null;
  mostrarDetalhes: boolean = false;
  registrosComInconsistencia: RegistrosPorUF[] = [];

  sortPipe = new SortByPipe();

  blocoVazio: BlocoVazio = {
    id: 'registros-inconsistencia',
    titulo: 'Registros com inconsistências',
    icone: './../../../../assets/img/custom-icons/icone-vazio-exclamacao.svg',
    subtitulo: `Nenhuma operação <br>com inconsistência adicionada recentemente.`,
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

  async expandirDetalhes() {
    this.mostrarDetalhes = !this.mostrarDetalhes;

    if (this.mostrarDetalhes) {
      this.registrosComInconsistencia = [];

      this.dashboardService.obterRegistrosComInconsistencia(this.filtro.dataInicio, this.filtro.dataFim).subscribe(response => {
        if (response.registrosComInconsistencias) {
          let registrosEmOrdem = this.sortPipe.transform(response.registrosComInconsistencias.filter(r => r.uf), 'asc', 'uf');
          this.registrosComInconsistencia = registrosEmOrdem;
        }
      });
    }

    this.expandido.emit(this.mostrarDetalhes);
  }

  private async obterDados() {
    return await lastValueFrom(this.dashboardService.obterRegistrosComInconsistencia(this.filtro.dataInicio, this.filtro.dataFim));
  }

  private formatarTotal(total: number) {
    this.totalFormatado = null;
    if (total !== null) {
      this.loading = false;
      this.totalFormatado = total.toLocaleString();
    }
  }
}
