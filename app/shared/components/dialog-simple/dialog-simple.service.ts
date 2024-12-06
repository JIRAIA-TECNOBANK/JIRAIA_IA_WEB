import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from "@angular/material/legacy-dialog";
import { DialogSimple } from "./dialog-simple.model";
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { DialogSimpleComponent } from "./dialog-simple.component";
import { Injectable } from "@angular/core";

@Injectable()
export class DialogSimpleService {

    private settings: DialogSimple = new DialogSimple();

    constructor(public dialog: MatDialog) { }

    showDialog(message: string, textButton: string, title: string = '', iconType: 'success' | 'fail' | 'none' = 'none'): MatDialogRef<DialogSimpleComponent, any> {

        this.settings.message = message;
        this.settings.title = title;
        this.settings.iconType = iconType;
        this.settings.textButton = textButton;

        return this.dialog.open(DialogSimpleComponent, {
            data: { settings: this.settings },
            scrollStrategy: new NoopScrollStrategy()
        })
    }
}