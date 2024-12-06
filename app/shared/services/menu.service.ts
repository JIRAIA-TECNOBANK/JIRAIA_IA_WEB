import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { IMenuService } from "./interfaces/menu.service";

@Injectable()
export class MenuService implements IMenuService {

    constructor() { }

    private _activeMenu: BehaviorSubject<boolean> = new BehaviorSubject(null);
    public activeMenu$ = this._activeMenu.asObservable().pipe();

    /**
     * 
     * @param activeMenu (Mostrar menu lateral: true | Esconder menu lateral: false)
     */
    activateMenu(activeMenu: boolean): void { this._activeMenu.next(activeMenu); }
}