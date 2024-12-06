import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Utility } from 'src/app/core/common/utility';

@Component({
  selector: 'app-dialog-informativo',
  templateUrl: './dialog-informativo.component.html',
  styleUrls: ['./dialog-informativo.component.scss']
})
export class DialogInformativoComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data) {
    this.innerHtml = this.data.mensagemModal;
    this.showActionButtons = this.data?.showActionButtons ?? true;
  }

  utility = Utility;
  innerHtml: string;
  showActionButtons: boolean = true;
}
