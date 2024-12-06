import { Component } from '@angular/core';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';

@Component({
  selector: 'app-encontrar-documento-dialog',
  templateUrl: './encontrar-documento-dialog.component.html',
  styleUrls: ['./encontrar-documento-dialog.component.scss']
})
export class EncontrarDocumentoDialogComponent {
  palavraChave: string = null;

  constructor(private dialogService: DialogCustomService) {
  }

  ngOnDestroy(): void {
    this.dialogService.setDialogData('nodata');
  }

  setarPalavraChave(): void {
    this.dialogService.setDialogData({
      palavraChave: this.palavraChave,
    });
  }
}
