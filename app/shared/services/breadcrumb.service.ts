import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {

  constructor() { }

  private _paginaTitulo: BehaviorSubject<string> = new BehaviorSubject('');
  public paginaTitulo$ = this._paginaTitulo.asObservable().pipe(filter(paginaTitulo => !!paginaTitulo));

  carregarPaginaTitulo(paginaTitulo: string): void { this._paginaTitulo.next(paginaTitulo); }
}