import { ChangeDetectorRef, Component, ComponentRef, Inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Utility } from 'src/app/core/common/utility';
import { DialogCustomService } from '../../services/dialog-custom.service';

@Component({
  selector: 'app-dialog-custom',
  templateUrl: './dialog-custom.component.html',
  styleUrls: ['./dialog-custom.component.scss']
})
export class DialogCustomComponent implements OnInit {

  utility = Utility;

  @ViewChild('target', { read: ViewContainerRef, static: true }) vcRef: ViewContainerRef;

  componentRef: ComponentRef<any>;
  disableSave: boolean = false;
  showActionButtons: boolean = true;
  titleClass: string = null;
  buttonsAlign: string = "end";
  disableCancelBtn: boolean = false;

  constructor(
    private dialogService: DialogCustomService,
    private _ref: ChangeDetectorRef,

    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
    this.componentRef = this.vcRef.createComponent(this.data.component);
    if (this.data.showActionButtons != undefined) { this.showActionButtons = this.data.showActionButtons }
    /**
     * Se essa opção estiver marcada, o botão de confirmação não aparece enquanto o DialogData não estiver válido
     */
    if (this.data.disableSaveWithoutData) {
      this.dialogService.dialogData$.subscribe(value => {
        this.disableSave = value == 'nodata';
        this._ref.detectChanges();
      });
    }

    if (this.data.titleClass) { this.titleClass = this.data.titleClass; }

    if (this.data.buttonsAlign) { this.buttonsAlign = this.data.buttonsAlign; }

    if (this.data.disableCancelBtn) { this.disableCancelBtn = this.data.disableCancelBtn; }
  }
}
