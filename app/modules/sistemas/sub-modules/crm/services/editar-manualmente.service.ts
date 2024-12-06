import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Veiculo } from '../../admin/core/models/_portal/contratos/veiculo.model';

@Injectable({
  providedIn: 'root'
})
export class EditarManualmenteService {

  constructor() { }

  private _protocolos: BehaviorSubject<string[]> = new BehaviorSubject([]);
  public protocolos$ = this._protocolos.asObservable().pipe(filter(protocolos => !!protocolos));

  retornoProtocolos(protocolos: string[]): void { this._protocolos.next(protocolos); }

  private _veiculosAdicionados: BehaviorSubject<Veiculo[]> = new BehaviorSubject([]);
  public veiculosAdicionados$ = this._veiculosAdicionados.asObservable().pipe(filter(veiculosAdicionados => !!veiculosAdicionados));

  retornoVeiculosAdicionados(veiculos: Veiculo[]): void { this._veiculosAdicionados.next(veiculos); }
}
