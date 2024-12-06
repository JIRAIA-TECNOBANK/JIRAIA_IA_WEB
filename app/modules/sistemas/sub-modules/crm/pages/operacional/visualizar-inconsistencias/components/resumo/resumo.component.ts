import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MensagemInconsistenciaContrato } from 'src/app/modules/sistemas/sub-modules/admin/core/models/_portal/inconsistencias-contrato/mensagem-inconsistencia-contrato.model';
import { ContratoService } from 'src/app/modules/sistemas/sub-modules/admin/services/_portal/contrato.service';

@Component({
  selector: 'app-visualizar-inconsistencias-resumo',
  templateUrl: './resumo.component.html',
  styleUrls: ['./resumo.component.scss']
})
export class ResumoComponent implements OnInit {

  constructor(private contratoService: ContratoService) { }

  @Input('protocolo') protocolo: string;
  @Output() inconsistencia: EventEmitter<boolean> = new EventEmitter<boolean>();

  mensagensInconsistencias: MensagemInconsistenciaContrato[] = [];
  isLoading: boolean = true;

  ngOnInit(): void {
    this.carregaDados();
  }

  carregaDados() {
    if (this.protocolo != undefined) {
      this.contratoService.obterInconsistenciasContrato(this.protocolo).subscribe(response => {
        this.mensagensInconsistencias = response.inconsistenciasContrato;
        this.isLoading = false;
      })
    }
  }
}
