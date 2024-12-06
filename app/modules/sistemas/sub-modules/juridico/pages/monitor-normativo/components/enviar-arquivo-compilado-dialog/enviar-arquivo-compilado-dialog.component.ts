import { Component, ElementRef, ViewChild } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';

@Component({
  selector: 'app-enviar-arquivo-compilado-dialog',
  templateUrl: './enviar-arquivo-compilado-dialog.component.html',
  styleUrls: ['./enviar-arquivo-compilado-dialog.component.scss']
})
export class EnviarArquivoCompiladoDialogComponent {

  utility = Utility

  @ViewChild("fileDropRef", { static: false }) fileDropEl: ElementRef;

  files: any = null;

  constructor(private dialogService: DialogCustomService) { }

  ngOnDestroy(): void {
    this.files = null;
    this.dialogService.setDialogData('nodata');
  }

  onFileDropped($event) {
    this.prepareFilesList($event);
  }

  fileBrowseHandler(files) {
    this.prepareFilesList(files);
  }

  prepareFilesList(files: Array<any>) {
    this.files = null;

    this.files = files[0];

    if (files) this.setDialogData(files);

    this.fileDropEl.nativeElement.value = "";
  }

  onClickFile(fileDropRef: any) {
    fileDropRef.click();
  }

  setDialogData(files) {
    const file = files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let base64 = reader.result.toString();
      this.dialogService.setDialogData({
        nomeArquivo: file.name,
        file: base64.split('base64,')[1],
        mimeType: file.type
      });
    };
  }
}
