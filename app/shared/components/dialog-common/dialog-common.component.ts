import { Component, Inject, OnInit } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { DialogCommon } from '../../../modules/sistemas/core/models/common/dialog-common.model';
import { Utility } from 'src/app/core/common/utility';

@Component({
  selector: 'app-dialog-common',
  templateUrl: './dialog-common.component.html',
  styleUrls: ['./dialog-common.component.scss']
})
export class DialogCommonComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogCommon) { }

  utility = Utility;
  disableCancelBtn: boolean = false;

  ngOnInit(): void {
    if (this.data.disableCancelBtn) { this.disableCancelBtn = this.data.disableCancelBtn; }
  }
}
