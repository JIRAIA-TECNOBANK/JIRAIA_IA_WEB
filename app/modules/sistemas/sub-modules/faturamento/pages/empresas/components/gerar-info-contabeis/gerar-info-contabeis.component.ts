import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { InformacoesContabeis } from '../../../../core/models/empresa/informacoes-contabeis.model';
import { EmpresaFaturamentoService } from '../../../../services/empresa.service';

@Component({
  selector: 'app-gerar-info-contabeis',
  templateUrl: './gerar-info-contabeis.component.html',
  styleUrls: ['./gerar-info-contabeis.component.scss']
})
export class GerarInfoContabeisComponent implements OnInit {

  @Input('empresaId') empresaId: number;
  @Output() nextTab: EventEmitter<boolean> = new EventEmitter<boolean>();

  utility = Utility;

  formulario = this.fb.group({
    contaContabil: ['11020100', Validators.compose([Validators.required, Validators.maxLength(15)])],
    codigoBacen: ['01058', Validators.compose([Validators.required, Validators.maxLength(15)])],
    condicaoPagamento: ['029', Validators.compose([Validators.required, Validators.maxLength(15)])],
    naturezaFinanceira: ['1110001', Validators.compose([Validators.required, Validators.maxLength(15)])],
    codigoPais: ['105', Validators.compose([Validators.required, Validators.maxLength(15)])]
  });

  formularioAberto: boolean = true;

  constructor(private fb: UntypedFormBuilder,
    private notifierService: NotifierService,
    private empresaFaturamentoService: EmpresaFaturamentoService) { }

  ngOnInit(): void {
    this.carregarInformacoes();
  }

  confirmar() {
    let request: InformacoesContabeis = <InformacoesContabeis>{
      empresaId: this.empresaId,
      contaContabil: this.formulario.get('contaContabil').value,
      codigoBacen: this.formulario.get('codigoBacen').value,
      condicaoPagamento: this.formulario.get('condicaoPagamento').value,
      naturezaFinanceira: this.formulario.get('naturezaFinanceira').value,
      codigoPais: this.formulario.get('codigoPais').value,
    }

    this.empresaFaturamentoService.alterarInformacoesContabeis(request).subscribe({
      next: (response) => {
        if (response?.editado) {
          this.sucesso();
          return;
        }
      },
      error: (error) => {
        this.erro(error.message);
      }
    })
  }

  private carregarInformacoes() {
    this.empresaFaturamentoService.obterInformacoesContabeis(this.empresaId).subscribe({
      next: (response) => {
        if (response.informacoesContabeis) {
          this.formulario.patchValue({
            contaContabil: response.informacoesContabeis.contaContabil,
            codigoBacen: response.informacoesContabeis.codigoBacen,
            condicaoPagamento: response.informacoesContabeis.condicaoPagamento,
            naturezaFinanceira: response.informacoesContabeis.naturezaFinanceira,
            codigoPais: response.informacoesContabeis.codigoPais
          })
        }
      },
      error: (error) => {
        this.erro(error.message);
      }
    })
  }

  private sucesso() {
    this.notifierService.showNotification('Informações financeiras e contábeis salvas com sucesso.', null, 'success');
    this.formularioAberto = false;
    this.nextTab.emit();
  }

  private erro(mensagem: string) {
    this.notifierService.showNotification(mensagem, null, 'error');
  }
}
