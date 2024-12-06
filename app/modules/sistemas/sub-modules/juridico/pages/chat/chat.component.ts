import { Component } from '@angular/core';
import { HackatonService } from '../../services/hackaton.service';
import { ResumirDocumentoDialogComponent } from './resumir-documento-dialog/resumir-documento-dialog.component';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';
import { EncontrarDocumentoDialogComponent } from './encontrar-documento-dialog/encontrar-documento-dialog.component';

interface Mensagem {
  id: number | null;
  text: string;
  sender: 'user' | 'ai';
  files: MensagemArquivo[];
}

interface MensagemArquivo {
  nome: string;
  base64: string
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  constructor(
    private hackatonService: HackatonService,
    private dialog: MatDialog,
    private dialogService: DialogCustomService) { }

  messages: Mensagem[] = [];
  userInput: string = '';
  utility = Utility;
  idAgrupador: number;

  enviarMensagem(): void {
    if (this.userInput.trim()) {
      this.messages.push({
        id: this.obterIdAgrupador(),
        text: this.userInput,
        sender: 'user',
        files: []
      });

      this.getAIResponse(this.userInput);

      this.userInput = '';
    }
  }

  enviarDocumentoParaResumo(): void {
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'resumo-documento'),
      width: '500px',
      data: {
        component: ResumirDocumentoDialogComponent,
        title: 'Resumir documento',
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

        const arquivoMensagem: MensagemArquivo = {
          nome: nomeArquivo,
          base64: fileBase64
        };

        this.messages.push({ id: this.obterIdAgrupador(), text: 'Faça um resumo desse arquivo', sender: 'user', files: [arquivoMensagem] });

        this.messages.push({ id: this.obterIdAgrupador(), text: 'Claro, aguarde enquanto faço a análise do arquivo', sender: 'ai', files: [] });

        this.hackatonService.obterResumoDeDocumento(arquivo).subscribe({
          next: (resumo) => {
            this.messages.push({ id: this.obterIdAgrupador(), text: resumo.message, sender: 'ai', files: [] })
          }
        });
      }
    });
  }

  procurarDocumentoPorPalavraChave(): void {
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'procurar-documento'),
      width: '500px',
      data: {
        component: EncontrarDocumentoDialogComponent,
        title: 'Procurar documento por frase ou palavra chave',
        buttonCancel: {
          value: false,
          text: 'Fechar',
        },
        buttonConfirm: {
          value: true,
          text: 'Procurar',
        },
        disableSaveWithoutData: true,
      },
    });

    dialogRef.beforeClosed().subscribe((confirmacao) => {
      let palavraChave = '';

      this.dialogService.dialogData$.subscribe((data) => {
        palavraChave = data.palavraChave;
      });

      if (palavraChave == 'nodata') return;

      if (confirmacao) {
        this.messages.push({ id: this.obterIdAgrupador(), text: `Procure para mim documentos que contenham essa sentença "${palavraChave}"`, sender: 'user', files: [] });

        this.messages.push({ id: this.obterIdAgrupador(), text: 'Claro, aguarde enquanto faço a análise em busca de arquivos', sender: 'ai', files: [] });

        this.obterArquivoPorPalavraChave(palavraChave);
      }
    });
  }

  obterArquivoPorPalavraChave(palavraChave: string){
    this.hackatonService.encontrarDocumentosPorPalavraChave(palavraChave).subscribe({
      next: (arquivos) => {
        if (arquivos.quantidade <= 0) {
          this.messages.push({ id: this.obterIdAgrupador(), text: `Sinto muito, mas não encontrei arquivos com a sentença "${palavraChave}"`, sender: 'ai', files: [] });
        } else {
          const arquivosEncontrados: MensagemArquivo[] = [];

          arquivos.lista.forEach(t => {
            arquivosEncontrados.push({
              nome: t.nome,
              base64: t.base64
            });
          });

          this.messages.push({ id: this.obterIdAgrupador(), text: `Encontrei esses arquivos com a sentença "${palavraChave}"`, sender: 'ai', files: arquivosEncontrados });
        }
      }
    });
  }

  getAIResponse(userMessage: string): void {
    this.hackatonService.obterResposta(userMessage, this.obterIdAgrupador()).subscribe({
      next: (response) => {
        if (!this.obterIdAgrupador()) {
          this.idAgrupador = response.idAgrupador;
        }

        this.messages.push({ id: this.obterIdAgrupador(), text: response.message, sender: 'ai', files: [] });
      }
    })
  }

  obterIdAgrupador() {
    if (this.idAgrupador) {
      return this.idAgrupador;
    } else {
      return null
    }
  }

  downloadFile(fileName: string, base64Data: string) {
    const linkSource = `data:application/octet-stream;base64,${base64Data}`;
    const downloadLink = document.createElement('a');

    downloadLink.href = linkSource;
    downloadLink.download = fileName;
  
    downloadLink.click();
  
    downloadLink.remove();
  }  
}