import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { filter } from "rxjs/operators";
import { IDialogCustomService } from "./interfaces/dialog-custom.service";

@Injectable()
export class DialogCustomService implements IDialogCustomService {

    private _dialogData: BehaviorSubject<any> = new BehaviorSubject(null);
    public dialogData$ = this._dialogData.asObservable().pipe(filter(dialogData => !!dialogData));

    /**
     * 
     * @param dialogData (Retorno do Dialog, para limpar, envie como 'nodata')
     */
    setDialogData(dialogData: any): void { this._dialogData.next(dialogData); }
}