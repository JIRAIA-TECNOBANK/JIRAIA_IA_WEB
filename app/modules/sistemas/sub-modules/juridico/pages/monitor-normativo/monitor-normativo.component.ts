import { Component } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';
import { ResumirDocumentoDialogComponent } from '../chat/resumir-documento-dialog/resumir-documento-dialog.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { EnviarArquivoCompiladoDialogComponent } from './components/enviar-arquivo-compilado-dialog/enviar-arquivo-compilado-dialog.component';
import { HackatonService } from '../../services/hackaton.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';

@Component({
  selector: 'app-monitor-normativo',
  templateUrl: './monitor-normativo.component.html',
  styleUrls: ['./monitor-normativo.component.scss']
})
export class MonitorNormativoComponent {
  numeroTab: number = 1;
  utility = Utility;

  constructor(private dialog: MatDialog, private dialogService: DialogCustomService, private hackatonService: HackatonService, private notifierService: NotifierService) { }

  atualizarPagina(): void { }

  alterarTab(tab: any) {
    this.numeroTab = tab.index;
  }

  enviarArquivoCompilado(): void {
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'enviar-documento-compilado'),
      width: '500px',
      data: {
        component: EnviarArquivoCompiladoDialogComponent,
        title: 'Enviar documento compilado',
        buttonCancel: {
          value: false,
          text: 'Fechar',
        },
        buttonConfirm: {
          value: true,
          text: 'Enviar',
        },
        disableSaveWithoutData: true,
      },
    });

    dialogRef.beforeClosed().subscribe((confirmacao) => {
      let fileBase64 = '';
      let nomeArquivo = '';
      let mimeType = '';

      this.dialogService.dialogData$.subscribe((data) => {
        fileBase64 = data.file;
        nomeArquivo = data.nomeArquivo;
        mimeType = data.mimeType;
      });

      if (fileBase64 == 'nodata') return;

      if (confirmacao) {
        let arquivo = this.utility.converterBase64ParaArquivo(fileBase64, nomeArquivo, mimeType);

        this.hackatonService.enviarArquivoCompilado(arquivo).subscribe({
          next: () => {
            this.notifierService.showNotification('Arquivo enviado com sucesso!', 'Arquivo compilado enviado', 'success');
          }
        });
      }
    });
  }
}
