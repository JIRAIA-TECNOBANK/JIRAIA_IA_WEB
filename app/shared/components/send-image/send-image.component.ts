import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { SendImageModel } from 'src/app/modules/sistemas/core/models/common/send-image.model';
import { ObterImagemResponse } from 'src/app/modules/sistemas/sub-modules/admin/core/responses/_portal/contrato/obter-imagem.response';
import { ContratoService } from 'src/app/modules/sistemas/sub-modules/admin/services/_portal/contrato.service';
import { DialogCustomService } from '../../services/dialog-custom.service';
import { ImagemService } from '../../services/imagem.service';

@Component({
  selector: 'app-send-image',
  templateUrl: './send-image.component.html',
  styleUrls: ['./send-image.component.scss']
})
export class SendImageComponent implements OnInit {

  @ViewChild("fileDropRef", { static: false }) fileDropEl: ElementRef;

  files: any = null;
  acceptedTypes: string[] = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/tiff"];
  fileError: string = null;
  pipe = new DatePipe('en-US');
  imagemURL: string = "";
  loading: boolean = false;
  fileName: string = "";
  fileDetails: string = "";
  fileExtension: string = "";
  dangerError: boolean = false;
  retornoUpload: boolean = false;
  obterImagem: ObterImagemResponse = <ObterImagemResponse>{ existeImagem: false, imagem: null, erro: null, success: null };

  constructor(
    private dialogService: DialogCustomService,
    private imagemService: ImagemService,
    private contratoService: ContratoService) { }

  ngOnInit(): void {
    this.dialogService.setDialogData('nodata');
    this.obterImagem = <ObterImagemResponse>{ existeImagem: false, imagem: null, erro: null, success: null };
    this.files = null;

    this.imagemService.imageData$.subscribe(img => {
      this.dangerError = false;
      this.obterImagem = img;
      this.retornoUpload = true;
      this.verificaImagemRetorno(img);
      if (img.existeImagem) { this.setImagemValores(img); }
    });
  }

  ngOnDestroy(): void {
    this.files = null;
    this.obterImagem = <ObterImagemResponse>{ existeImagem: false, imagem: null, erro: null, success: null };
    this.imagemURL = "";
    this.dialogService.setDialogData('nodata');
  }

  verificaImagemRetorno(img: any) {
    if (!img?.success) {
      this.fileError = img.erro;
      this.dangerError = true;
      return;
    }
  }

  setImagemValores(img: any) {
    this.dangerError = false;
    this.fileName = img.imagem.nome;
    this.fileExtension = img.imagem.nome.split('.').pop();
    this.fileDetails = this.pipe.transform(img.imagem.criadoEm, 'dd-MM-yy') + ' às ' + this.pipe.transform(img.imagem.criadoEm, 'HH:mm');
    this.getBase64();
  }

  onFileDropped($event) {
    // if (!this.permissoesMonitorOp.editar) return;

    this.prepareFilesList($event);
  }

  fileBrowseHandler(files) {
    this.prepareFilesList(files);
  }

  /**
   * Converte a lista de arquivos para uma lista normal
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    this.files = null;
    this.files = files[0];
    this.dangerError = false;

    if (this.acceptedTypes.find(type => type === files[0].type) === undefined) {
      this.fileError = 'Falha no upload, o formato é incompatível.'
      this.dangerError = true;
      this.setDialogData(files);
      return false;
    }

    if (!this.formatBytes(files[0].size)) {
      this.fileError = 'Falha no upload, tamanho superior ao permitido.'
      this.setDialogData(files);
      return false;
    }

    this.fileError = null;
    this.setDialogData(files);

    this.fileDropEl.nativeElement.value = "";
  }

  /**
   * Formata os bytes
   * @param bytes (Tamanho do arquivo em bytes)
   * @param decimals (Pontos decimais)
   */
  formatBytes(bytes, decimals = 2) {
    let megabytes = Utility.formatMegabytes(bytes);
    if (megabytes > 10) {
      this.files = null;
      return false;
    }

    let size = megabytes.toFixed(decimals);
    return size + 'MB';
  }

  /**
   * Trigger para o click do input file
   * @param fileDropRef (Input file)
   */
  onClickFile(fileDropRef: any) {
    // if (!this.permissoesMonitorOp.editar) return;

    fileDropRef.click();
  }
  //
  /**
   * Seta o DialogData com a base64 do arquivo selecionado
   * @param files (Lista de arquivos do input)
   */
  setDialogData(files) {
    this.retornoUpload = false;
    const file = files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let base64 = reader.result.toString();
      this.fileExtension = file.name.split('.').pop();
      let nomeArquivo = file.name.replace("." + this.fileExtension, "");
      let valor = nomeArquivo;
      if (valor.length > 30) {
        let invalidChar = 30 - valor.length;
        valor = valor.slice(0, invalidChar)
      }

      this.fileName = valor + "." + this.fileExtension;

      let sendImage: SendImageModel = <SendImageModel>{
        imagemBase64: base64.split('base64,')[1],
        nomeArquivo: this.fileName
      };

      let agora = new Date();
      this.fileDetails = this.pipe.transform(agora, 'dd-MM-yy') + ' às ' + this.pipe.transform(agora, 'HH:mm') + ' - tamanho ' + this.formatBytes(this.files?.size);

      if (this.fileError == null) {
        this.dialogService.setDialogData({ dataType: 'img', data: sendImage });
        return;
      }

      this.dialogService.setDialogData('nodata');
    };
  }

  getBase64() {
    this.contratoService.obterImagemDownload(this.obterImagem?.imagem.protocoloTransacao).toPromise()
      .then(response => {
        this.imagemURL = response.imagem.url;
        if (!this.fileDetails.includes('tamanho')) {
          this.fileDetails += ' - tamanho ' + this.formatBytes(response.imagem.tamanho);
        }
      })
  }

  getFileName() {
    return this.fileName;
  }

  getFileDetails() {
    return this.fileDetails;
  }

  showImage() {
    return this.files !== null || this.fileError || this.obterImagem.existeImagem;
  }

  onClickDownload() {
    this.loading = true;
    if (this.imagemURL == "") {
      this.contratoService.obterImagemDownload(this.obterImagem?.imagem.protocoloTransacao).toPromise()
        .then(response => {
          this.imagemURL = response.imagem.url; this.downloadImagem();
        })
    }
    else { this.downloadImagem(); }
  }


  downloadImagem() {
    var element = document.createElement('a');
    element.setAttribute('download', this.obterImagem?.imagem.nome);
    element.setAttribute('href', this.imagemURL)
    document.body.appendChild(element);
    element.click();

    this.loading = false;
  }
}
