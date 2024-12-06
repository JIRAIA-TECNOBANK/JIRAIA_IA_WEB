import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Utility } from 'src/app/core/common/utility';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';
import { TipoStatusImagem } from '../../../../core/enums/tipo-status-imagem.enum';

@Component({
  selector: 'app-dialog-enviar-arquivos-detran',
  templateUrl: './dialog-enviar-arquivos-detran.component.html',
  styleUrls: ['./dialog-enviar-arquivos-detran.component.scss'],
})
export class DialogEnviarArquivosDetranComponent implements OnInit {

  utility = Utility;

  addFile: any = null;
  files: any[] = [];
  filesPdf: any[] = [];
  acceptFiles: string[] = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];
  acceptFiles2: string[] = ['application/pdf'];
  acceptedTypes: string[] = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];
  fileExtension: string = '';
  fileName: string = '';
  fileDetails: string = '';
  pipe = new DatePipe('en-US');
  timerPrepareFileList: NodeJS.Timeout;
  timer: NodeJS.Timeout;
  uf: string;

  constructor(private dialogService: DialogCustomService, @Inject(MAT_DIALOG_DATA) public data) {
    this.uf = this.data.uf;
  }

  ngOnInit(): void { }

  fileBrowseHandler(files, ehPdf: boolean = false) {
    this.prepareFilesList(files, ehPdf);
  }

  onFileDropped($event, ehPdf: boolean = false) {
    this.prepareFilesList($event, ehPdf);
  }

  onClickFile(fileDropRef: any, ehPdf: boolean = false) {
    fileDropRef.click();
  }

  prepareFilesList(files: Array<any>, ehPdf: boolean = false) {
    this.addFile = [];

    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.readAsDataURL(files[i]);
      reader.onload = () => {
        let base64 = reader.result.toString();
        let file: any = {
          nome: files[i].name,
          type: files[i].type,
          tamanho: files[i].size,
          dataEnvio: this.pipe.transform(new Date(), 'dd-MM-yyyy - HH:mm:ss'),
          base64: base64.split('base64,')[1],
          ehPdf: ehPdf
        };
        ehPdf ? this.filesPdf.push(file) : this.files.push(file);
        this.addFile.push(file);
      };
    }

    Utility.watchCondition(
      this.timerPrepareFileList,
      () => {
        if (files.length === this.addFile.length) {
          this.processarImagens();
          return true;
        }
      },
      100
    );
  }

  processarImagens() {
    for (let i = 0; i < this.addFile.length; i++) {
      let ehPdf: boolean = this.addFile[i].ehPdf;
      let index = ehPdf ? this.filesPdf.indexOf(this.addFile[i]) : this.files.indexOf(this.addFile[i]);

      if (this.acceptedTypes.find((type) => type === this.addFile[i].type) === undefined || this.addFile[i].nome.split('.').pop().toUpperCase() === 'DOT') {
        ehPdf ? this.filesPdf[index].statusArquivo = TipoStatusImagem.FormatoInvalido : this.files[index].statusArquivo = TipoStatusImagem.FormatoInvalido;
      } else {
        ehPdf ? this.filesPdf[index].statusArquivo = TipoStatusImagem.Sucesso : this.files[index].statusArquivo = TipoStatusImagem.Sucesso;
      }
    }
    this.habilitarBotao();
  }

  habilitarBotao() {
    if (this.checarListaArquivos()) {
      this.dialogService.setDialogData({
        files: this.files,
        filesPdf: this.filesPdf
      });
      return;
    }
    this.dialogService.setDialogData('nodata');
  }

  checarListaArquivos(): boolean {
    let arquivosEhValido: boolean = false;

    if (this.files.length > 0 || this.filesPdf.length > 0) {
      return true;
    }

    for (let index = 0; index < this.files.length; index++) {
      const arquivo = this.files[index];
      if (
        arquivo.statusArquivo !== TipoStatusImagem.Processando &&
        arquivo.statusArquivo !== TipoStatusImagem.Sucesso
      ) {
        arquivosEhValido = false;
        return;
      }
    }

    for (let index = 0; index < this.filesPdf.length; index++) {
      const arquivo = this.filesPdf[index];
      if (
        arquivo.statusArquivo !== TipoStatusImagem.Processando &&
        arquivo.statusArquivo !== TipoStatusImagem.Sucesso
      ) {
        arquivosEhValido = false;
        return;
      }
    }

    return arquivosEhValido;
  }

  onClickDelete(file: any, ehPdf: boolean = false) {
    let index = ehPdf ? this.filesPdf.indexOf(file) : this.files.indexOf(file);
    let indexAddFile = this.addFile.indexOf(file);
    ehPdf ? this.filesPdf.splice(index, 1) : this.files.splice(index, 1);
    this.addFile.splice(indexAddFile, 1);
    this.habilitarBotao();
  }

  /**
   * Formata os bytes
   * @param bytes (Tamanho do arquivo em bytes)
   * @param decimals (Pontos decimais)
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) {
      return '0bytes';
    }
    const k = 1000;
    const dm = decimals <= 0 ? 0 : decimals;
    const sizes = ['bytes', 'kb', 'mb', 'gb', 'tb', 'pb', 'eb', 'zb', 'yb'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    let size = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return size + sizes[i];
  }

  getExtension(file) {
    return file.nome.split('.').pop().toUpperCase();
  }

  formatDate(date: string) {
    return Utility.formatGridDate(date);
  }

  desabilitarEnvioArquivo(files: any[]) {
    if (this.uf === 'AP') return false;
    if (this.uf != 'MG' && files?.length > 0) return true;
    if (this.uf === 'MG' && files?.length >= 2) return true;
    return false;
  }

  retornarNomeArquivo() {
    if (this.uf === 'SP') return 'ofícios';
    return 'boletos';
  }
}
