import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { TransacoesProtocoloDsMensagem } from '../../../../../../admin/core/models/_portal/transacoes/transacoes-protocolo-ds-mensagem.model';
import { Utility } from 'src/app/core/common/utility';

@Component({
  selector: 'app-dialog-ds-mensagem',
  templateUrl: './dialog-ds-mensagem.component.html',
  styleUrls: ['./dialog-ds-mensagem.component.scss']
})
export class DialogDsMensagemComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DialogDsMensagemComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private clipboard: Clipboard) { }

  transacaoProtocoloDsMensagem: TransacoesProtocoloDsMensagem[];
  copiado: boolean = false;

  ngOnInit(): void {
    this.transacaoProtocoloDsMensagem = this.data.transacaoProtocoloDsMensagem;
  }

  copiarDsMensagem(mensagem: string) {
    this.clipboard.copy(mensagem);
    this.copiado = true;
    Utility.waitFor(() => { this.copiado = false; }, 1000);
  }
}
