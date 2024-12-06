import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Utility } from 'src/app/core/common/utility';
import { NotaDebitoEmpresa } from 'src/app/modules/sistemas/sub-modules/faturamento/core/models/empresa/nota-debito-empresa.model';
import { TaxaDetran } from 'src/app/modules/sistemas/sub-modules/faturamento/core/models/taxa/taxa-detran.model';
import { EmpresaFaturamentoService } from 'src/app/modules/sistemas/sub-modules/faturamento/services/empresa.service';
import { TaxaService } from 'src/app/modules/sistemas/sub-modules/faturamento/services/taxa.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';

@Component({
  selector: 'app-consultar-preco-detran',
  templateUrl: './consultar-preco-detran.component.html',
  styleUrls: ['./consultar-preco-detran.component.scss']
})
export class ConsultarPrecoDetranComponent {

  @Input('uf') uf: string = null;
  @Input('empresaId') empresaId: number = null;
  @Input('taxaDetran') taxaDetran: TaxaDetran;
  @Input('tipoPreco') tipoPreco: number = null;
  @Output('fechar') fechar: EventEmitter<boolean> = new EventEmitter<boolean>();

  utility = Utility;

  constructor(private taxaService: TaxaService,
    private fb: UntypedFormBuilder,
    private empresaFaturamentoService: EmpresaFaturamentoService,
    private store: Store<{ preloader: IPreloaderState }>,
    private notifierService: NotifierService) { }

  formulario = this.fb.group({
    emitirNota: [false]
  });

  empresaTaxaDetranId: number = null;

  ngOnInit() {
    this.obterNotaDebito();
  }

  private obterNotaDebito() {
    this.empresaTaxaDetranId = null;

    this.empresaFaturamentoService.obterEmitirNotaDebitoPorEmpresa(this.empresaId, this.uf).subscribe(response => {
      if (response.empresaId) {
        this.empresaTaxaDetranId = response.empresaTaxaDetranId;
        this.formulario.get('emitirNota').patchValue(response.notaDebito);
      }
    });
  }

  cancelar() {
    this.fechar.emit(true);
  }

  salvarContinuar() {
    this.store.dispatch(showPreloader({ payload: '' }))
    let notaDebito = <NotaDebitoEmpresa>{
      empresaId: this.empresaId,
      notaDebito: this.formulario.get('emitirNota').value,
      uf: this.uf
    };

    if (this.empresaTaxaDetranId) {
      this.editarNotaDebitoEmpresa(notaDebito);
      return;
    }

    this.criarNotaDebitoEmpresa(notaDebito);
  }

  private criarNotaDebitoEmpresa(notaDebito: NotaDebitoEmpresa) {
    this.empresaFaturamentoService.criarNotaDebitoPorEmpresa(notaDebito).subscribe(response => {
      if (response.empresaTaxaDetranId) {
        this.sucesso();
        return;
      }

      this.erro(response.errors[0].message);
    });
  }

  private editarNotaDebitoEmpresa(notaDebito: NotaDebitoEmpresa) {
    this.empresaFaturamentoService.editarNotaDebitoPorEmpresa(this.empresaTaxaDetranId, notaDebito).subscribe(response => {
      if (response.empresaId) {
        this.sucesso();
        return;
      }

      this.erro(response.errors[0].message);
    });
  }

  private sucesso() {
    this.notifierService.showNotification('Configuração de nota de débito salva com sucesso!', null, 'success');
    this.store.dispatch(closePreloader())
    this.fechar.emit(true);
  }

  private erro(mensagem: string) {
    this.notifierService.showNotification(mensagem, null, 'error');
  }
}
