import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { AlterarCobrancaUnificadaRequest } from '../../../../core/requests/empresa/alterar-cobranca-unificada.request';
import { EmpresaFaturamentoService } from '../../../../services/empresa.service';

@Component({
  selector: 'app-consolidacao-notas',
  templateUrl: './consolidacao-notas.component.html',
  styleUrls: ['./consolidacao-notas.component.scss']
})
export class ConsolidacaoNotasComponent implements OnInit {

  utility = Utility;
  arquivosSelecionados = new SelectionModel<string>(true, []);

  formulario: FormGroup = this.fb.group({
    separadoUf: [true, Validators.required],
    consolidaNfPortal: [false],
    consolidaNdPortal: [false],
    consolidaExtratoPortal: [false],
  });

  mensagemAlerta: string = `
  <ul class="pl-2">
        <li>    
            <p class="bold">Para consolidar as informações de todas as UFs em uma única cobrança, selecione a opção desejada.</p>
        </li>
        <li>
            <p class="bold">Como exemplo: Ao selecionar a opção nota fiscal + boleto, ao invés da cobrança ser individual por UF, o sistema irá consolidar as operações de diferentes UFs realizadas por um mesmo credor e emitirá uma única nota fiscal e um único boleto para cobrança dessas operações.</p>
        </li>
        <li>
            <p class="bold">A etapa de conciliação através do Monitor de Faturamento não irá sofrer alteração e sua execução permanecerá de forma individual por UF e CNPJ.</p>
        </li>
        <li>
            <p class="bold">A consolidação das informações será realizada somente após as aprovações dos arquivos no Monitor de Faturamento, através da aba A Faturar.</p>
        </li>
    </ul>`;

  formularioAberto: boolean = true;

  @Input('empresaId') empresaId: number;
  @Output() nextTab: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private fb: FormBuilder, private empresaFaturamentoService: EmpresaFaturamentoService, private notifierService: NotifierService) { }

  ngOnInit(): void {
    this.carregarCobrancaUnificada();
  }

  confirmar() {
    let request: AlterarCobrancaUnificadaRequest = <AlterarCobrancaUnificadaRequest>{
      empresaId: this.empresaId,
      unificarNotaFiscal: this.formulario.get('consolidaNfPortal').value,
      unificarNotaDebito: this.formulario.get('consolidaNdPortal').value,
      unificarRelatorio: this.formulario.get('consolidaExtratoPortal').value,
    }

    this.editarConsolidacaoNotas(request);
  }

  selecionarTodos(checado: boolean) {
    this.formulario.get('consolidaNfPortal').patchValue(checado);
    this.formulario.get('consolidaNdPortal').patchValue(checado);
    this.formulario.get('consolidaExtratoPortal').patchValue(checado);
  }

  todosSelecionados() {
    return this.formulario.get('consolidaNfPortal').value && this.formulario.get('consolidaNdPortal').value && this.formulario.get('consolidaExtratoPortal').value;
  }

  isSelected(arquivo) {
    if (this.arquivosSelecionados.selected.length > 0) {
      return (this.arquivosSelecionados.selected.filter(u => u === arquivo).length > 0);
    }

    return this.arquivosSelecionados.isSelected(arquivo);
  }

  check(arquivo: string) {
    this.formulario.get(arquivo).patchValue(!this.formulario.get(arquivo).value);
  }

  mudaSeparadoUf(evento: boolean) {
    if (evento) {
      this.selecionarTodos(false);
    }
  }

  desabilitarBotaoSalvar() {
    if (!this.formulario.valid) return true;

    if (!this.formulario.get('separadoUf').value) {
      return !(this.formulario.get('consolidaNfPortal').value || this.formulario.get('consolidaNdPortal').value || this.formulario.get('consolidaExtratoPortal').value);
    }

    return false;
  }

  private carregarCobrancaUnificada() {
    this.empresaFaturamentoService.obterCobrancaUnificada(this.empresaId).subscribe(response => {
      if (response.cobrancaUnificada) {
        if (response.cobrancaUnificada.unificarNotaFiscal || response.cobrancaUnificada.unificarNotaDebito || response.cobrancaUnificada.unificarRelatorio) {
          this.formulario.get('separadoUf').patchValue(false);
          this.formulario.get('consolidaNfPortal').patchValue(response.cobrancaUnificada.unificarNotaFiscal);
          this.formulario.get('consolidaNdPortal').patchValue(response.cobrancaUnificada.unificarNotaDebito);
          this.formulario.get('consolidaExtratoPortal').patchValue(response.cobrancaUnificada.unificarRelatorio);
          return;
        }
      }

      this.formulario.get('separadoUf').patchValue(true);
    })
  }

  private editarConsolidacaoNotas(request: AlterarCobrancaUnificadaRequest) {
    this.empresaFaturamentoService.alterarCobrancaUnificada(request).subscribe(response => {
      if (response?.editado) {
        this.sucesso();
        return;
      }

      this.erro(response.errors[0].message);
    });
  }

  private sucesso() {
    this.notifierService.showNotification('Consolidação dos boletos de cobrança e relatórios salva com sucesso.', null, 'success');
    this.formularioAberto = false;
    this.nextTab.emit();
  }

  private erro(mensagem: string) {
    this.notifierService.showNotification(mensagem, null, 'error');
  }
}
