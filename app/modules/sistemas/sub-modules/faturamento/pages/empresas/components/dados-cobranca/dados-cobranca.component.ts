import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { Empresas } from 'src/app/modules/sistemas/sub-modules/crm/core/models/empresas/empresas.model';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { AlterarDadosCobrancaVencimentoRequest } from '../../../../core/requests/empresa/alterar-dados-cobranca-vencimento.resquest';
import { EmpresaFaturamentoService } from '../../../../services/empresa.service';

@Component({
  selector: 'app-dados-cobranca',
  templateUrl: './dados-cobranca.component.html',
  styleUrls: ['./dados-cobranca.component.scss']
})
export class DadosCobrancaComponent implements OnInit {

  @Input('empresaId') empresaId: number;
  @Output() nextTab: EventEmitter<boolean> = new EventEmitter<boolean>();

  utility = Utility;
  timer: NodeJS.Timeout;

  empresas: Empresas[] = null;
  empresasFiltradas: Empresas[] = [];

  empresaSelecionada: number = null;

  formulario = this.fb.group({
    vencimento: [null, Validators.required],
    ultimoDia: [false]
  });

  editarCobranca: boolean = false;
  mensagemAlerta: string = `
  <ul class="pl-2">
        <li>
            <p class="bold">Todos os boletos de cobrança das operações realizadas nas diferentes UFs terão o mesmo vencimento.</p>
        </li>
        <li>
            <p class="bold">Quando ativada a opção "Vencimento no último dia do mês", o vencimento será variável a depender do mês, podendo ocorrer no dia 28, 29, 30 e 31.</p>
        </li>
    </ul>`;

  formularioAberto: boolean = true;

  constructor(private fb: UntypedFormBuilder,
    private notifierService: NotifierService,
    private empresaFaturamentoService: EmpresaFaturamentoService) { }

  ngOnInit(): void {
    this.carregarDadosCobranca();
    this.formulario.get('ultimoDia').valueChanges.subscribe(value => {
      if (value) {
        this.formulario.get('vencimento').reset();
        this.formulario.get('vencimento').disable();
        return;
      }

      this.formulario.get('vencimento').enable();
    })
  }

  confirmar() {
    let request = <AlterarDadosCobrancaVencimentoRequest>{
      empresaId: +this.empresaId,
      diaVencimento: this.formulario.get('vencimento').value,
      ultimoDia: this.formulario.get('ultimoDia').value
    };

    this.editarDadosCobranca(request);
  }

  private editarDadosCobranca(request: AlterarDadosCobrancaVencimentoRequest) {
    this.empresaFaturamentoService.alterarDadosCobrancaVencimento(request).subscribe(response => {
      if (response?.editado) {
        this.sucesso();
        return;
      }

      this.erro(response.errors[0].message);
    });
  }

  private sucesso() {
    this.editarCobranca = true;
    this.notifierService.showNotification('Dados de vencimento de cobrança salvos com sucesso.', null, 'success');
    this.formularioAberto = false;
    this.nextTab.emit();
  }

  private erro(mensagem: string) {
    this.notifierService.showNotification(mensagem, null, 'error');
  }

  private carregarDadosCobranca() {
    this.empresaFaturamentoService.obterDadosCobrancaVencimento(this.empresaId).subscribe(response => {
      if (response.cobrancaVencimento !== null) {
        this.editarCobranca = true;
        this.formulario.patchValue({
          vencimento: response.cobrancaVencimento.diaVencimento,
          ultimoDia: response.cobrancaVencimento.ultimoDia
        });
        return;
      }

      this.formulario.get('vencimento').patchValue(20);
    });
  }
}
