import { DatePipe } from '@angular/common';
import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { UntypedFormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';
import { ArtigoDocumento } from '../../../../../core/models/central-ajuda/artigo-documento';

@Component({
  selector: 'app-dialog-complementar',
  templateUrl: './dialog-complementar.component.html',
  styleUrls: ['./dialog-complementar.component.scss']
})
export class DialogComplementarComponent implements OnInit {

  utility = Utility;

  constructor(
    private fb: UntypedFormBuilder,
    private dialogService: DialogCustomService,
    private notifierService: NotifierService,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.content = data.content;
    this.type = data.type;
  }

  @ViewChild("fileDropRef", { static: false }) fileDropEl: ElementRef;

  formulario: FormGroup;
  content: any = null;
  type: string = null;

  files: any = null;
  acceptedTypes: string[] = ["application/pdf"];
  fileName: string = "";
  fileDetails: string = "";
  fileExtension: string = "";
  pipe = new DatePipe('en-US');

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Trigger para o click do input file
   * @param fileDropRef (Input file)
   */
  onClickFile(fileDropRef: any) {
    fileDropRef.click();
  }

  fileBrowseHandler(files) {
    this.prepareFilesList(files);
  }

  onFileDropped($event) {
    this.prepareFilesList($event);
  }

  onClickDelete() {
    this.formulario.get('conteudo').reset();
  }

  private initializeForm() {
    this.formulario = this.fb.group({
      conteudo: [null, Validators.required]
    });

    if (this.content == null) { this.dialogService.setDialogData("nodata"); }
    else {
      if (this.type === 'add-arquivo') {
        let documento = (this.content as ArtigoDocumento[])[0];
        this.fileName = documento.nome;
        this.fileDetails = `${this.pipe.transform(documento.criadoEm, 'dd-MM-yy')} às ${this.pipe.transform(documento.criadoEm, 'HH:mm')} - tamanho ${this.formatBytes(documento.tamanhoArquivo)}`;
      }

      this.formulario.get('conteudo').patchValue(this.content);
    }

    this.formulario.get('conteudo').valueChanges.subscribe(value => {
      if (value) {
        this.dialogService.setDialogData({
          dataType: this.type,
          data: value
        });
        return;
      }

      this.dialogService.setDialogData("nodata");
    })
  }

  /**
   * Converte a lista de arquivos para uma lista normal
   * @param files (Files List)
   */
  private prepareFilesList(files: Array<any>) {
    this.files = null;
    this.files = files[0];

    if (this.acceptedTypes.find(type => type === files[0].type) === undefined) {
      this.notifierService.showNotification('Falha no upload, o formato é incompatível.', '', 'error');
      this.formulario.get('conteudo').reset();
      return false;
    }

    this.setFileData(files);

    this.fileDropEl.nativeElement.value = "";
  }

  /**
  * @param files (Lista de arquivos do input)
  */
  private setFileData(files) {
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

      let tamanho = this.formatBytes(this.files?.size);

      let agora = new Date();
      this.fileDetails = this.pipe.transform(agora, 'dd-MM-yy') + ' às ' + this.pipe.transform(agora, 'HH:mm') + ' - tamanho ' + tamanho;

      let arquivo: ArtigoDocumento[] = <ArtigoDocumento[]>[{
        arquivoBase64: base64?.split('base64,')[1],
        nome: this.fileName,
        tamanhoArquivo: this.files?.size,
        criadoEm: agora.toString()
      }];

      this.formulario.get('conteudo').patchValue(arquivo);
    };
  }

  /**
   * Formata os bytes
   * @param bytes (Tamanho do arquivo em bytes)
   * @param decimals (Pontos decimais)
   */
  private formatBytes(bytes, decimals = 2) {
    if (bytes === 0) {
      return "0bytes";
    }
    const k = 1000;
    const dm = decimals <= 0 ? 0 : decimals;
    const sizes = ["bytes", "kb", "mb", "gb", "tb", "pb", "eb", "zb", "yb"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    let size = parseFloat((bytes / Math.pow(k, i)).toFixed(dm))

    return size + sizes[i];
  }
}
