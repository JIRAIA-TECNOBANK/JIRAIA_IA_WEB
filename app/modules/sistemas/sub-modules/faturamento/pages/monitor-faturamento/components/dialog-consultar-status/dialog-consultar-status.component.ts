import { Component, Inject } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { TableConciliacao } from '../../../../core/models/faturamento-conciliado/table-conciliacao.model';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { TipoMensagemProtheus } from 'src/app/modules/sistemas/sub-modules/crm/core/enums/tipo-mensagem-protheus.enum';
import { StatusProtheus } from '../../../../core/models/faturamento-conciliado/status-protheus.model';

@Component({
  selector: 'app-dialog-consultar-status',
  templateUrl: './dialog-consultar-status.component.html',
  styleUrls: ['./dialog-consultar-status.component.scss']
})
export class DialogConsultarStatusComponent {
  utility = Utility;
  notaFiscal: StatusProtheus | null;
  notaDebito: StatusProtheus | null;
  empresa: string;
  uf: string;
  clienteId: string;

  constructor(@Inject(MAT_DIALOG_DATA) public dados) {
    this.notaDebito = dados.notaDebito;
    this.notaFiscal = dados.notaFiscal;
    this.empresa = dados.empresa;
    this.uf = dados.uf;
    this.clienteId = dados.clienteId;
  }

  getMensagem(nota: StatusProtheus) {
    return TipoMensagemProtheus[nota.codigoRetorno] || '';
  }
}
