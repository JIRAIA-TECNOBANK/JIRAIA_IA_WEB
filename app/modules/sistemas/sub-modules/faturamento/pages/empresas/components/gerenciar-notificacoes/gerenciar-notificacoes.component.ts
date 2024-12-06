import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { FaturamentoNotificacao } from '../../../../core/models/empresa/faturamento-notificacao.model';
import { EmpresaFaturamentoService } from '../../../../services/empresa.service';

@Component({
  selector: 'app-gerenciar-notificacoes',
  templateUrl: './gerenciar-notificacoes.component.html',
  styleUrls: ['./gerenciar-notificacoes.component.scss']
})
export class GerenciarNotificacoesComponent implements OnInit {

  utility = Utility;
  habilitado: boolean = false;
  arquivosSelecionados = new SelectionModel<string>(true, []);
  form = this.formBuilder.group({
    habilitaNotificacaoPortal: [false],
    notificaArquivosPortal: [false],
    notificaArquivosComAnexoPortal: [false],
    notificaNfPortal: [false],
    notificaNdPortal: [false],
    notificaExtratoPortal: [false],
    id: [null]
  });

  formularioAberto: boolean = true;

  @Input('empresaId') empresaId: number;
  @Output() formularioValores: EventEmitter<any> = new EventEmitter<any>();

  constructor(private formBuilder: UntypedFormBuilder,
    private empresaService: EmpresaFaturamentoService,
    private notifierService: NotifierService
  ) { }

  ngOnInit(): void {
    this.obterNotificacoes();

    //#region permitido selecionar somente UMA opcao
    this.form.get('notificaArquivosPortal').valueChanges.subscribe(value => {
      if (value) {
        this.form.get('notificaArquivosComAnexoPortal').patchValue(false);
        this.form.get('notificaNfPortal').patchValue(false);
        this.form.get('notificaNdPortal').patchValue(false);
        this.form.get('notificaExtratoPortal').patchValue(false);
      }
    });

    this.form.get('notificaArquivosComAnexoPortal').valueChanges.subscribe(value => {
      if (value) {
        this.form.get('notificaArquivosPortal').patchValue(false);
      }
    });
    //#endregion
  }

  selecionarTodos(event) {
    this.form.get('notificaNfPortal').patchValue(event.checked);
    this.form.get('notificaNdPortal').patchValue(event.checked);
    this.form.get('notificaExtratoPortal').patchValue(event.checked);
  }

  todosSelecionados() {
    return this.form.get('notificaNfPortal').value && this.form.get('notificaNdPortal').value && this.form.get('notificaExtratoPortal').value;
  }

  isSelected(arquivo) {
    if (this.arquivosSelecionados.selected.length > 0) {
      return (this.arquivosSelecionados.selected.filter(u => u === arquivo).length > 0);
    }

    return this.arquivosSelecionados.isSelected(arquivo);
  }

  check(arquivo: string) {
    this.form.get(arquivo).patchValue(!this.form.get(arquivo).value);
  }

  alterarConfiguracao() {
    this.habilitado = !this.habilitado;
    if (!this.habilitado) {
      this.form.get('notificaArquivosPortal').patchValue(false);
      this.form.get('notificaArquivosComAnexoPortal').patchValue(false);
      this.form.get('notificaNfPortal').patchValue(false);
      this.form.get('notificaNdPortal').patchValue(false);
      this.form.get('notificaExtratoPortal').patchValue(false);
    }

    this.form.get('habilitaNotificacaoPortal').patchValue(this.habilitado);
  }

  salvarNotificacoes() {
    let faturamentoNotificacao: FaturamentoNotificacao = <FaturamentoNotificacao>{
      empresaId: +this.empresaId,
      habilitaNotificacaoPortal: this.form.get('habilitaNotificacaoPortal').value,
      notificaArquivosComAnexoPortal: this.form.get('notificaArquivosComAnexoPortal').value,
      notificaArquivosPortal: this.form.get('notificaArquivosPortal').value,
      notificaExtratoPortal: this.form.get('notificaExtratoPortal').value,
      notificaNdPortal: this.form.get('notificaNdPortal').value,
      notificaNfPortal: this.form.get('notificaNfPortal').value,
      id: this.form.get('id').value
    };

    this.empresaService.alterarFaturamentoNotificacoes(faturamentoNotificacao).subscribe(response => {
      if (response.editado) {
        this.notifierService.showNotification('Notificações de faturamento salvos com sucesso!', null, 'success');
        this.formularioAberto = false;
        return;
      }

      this.notifierService.showNotification('Houve um erro interno!', null, 'error');
    })
  }

  private obterNotificacoes() {
    this.empresaService.obterFaturamentoNotificacoes(this.empresaId).subscribe(response => {
      this.habilitado = response.cobrancaNotificacao.habilitaNotificacaoPortal;

      this.form.patchValue({
        habilitaNotificacaoPortal: response.cobrancaNotificacao.habilitaNotificacaoPortal,
        notificaArquivosPortal: response.cobrancaNotificacao.notificaArquivosPortal,
        notificaArquivosComAnexoPortal: response.cobrancaNotificacao.notificaArquivosComAnexoPortal,
        notificaNfPortal: response.cobrancaNotificacao.notificaNfPortal,
        notificaNdPortal: response.cobrancaNotificacao.notificaNdPortal,
        notificaExtratoPortal: response.cobrancaNotificacao.notificaExtratoPortal,
        id: response.cobrancaNotificacao.id
      });
    });
  }
}
