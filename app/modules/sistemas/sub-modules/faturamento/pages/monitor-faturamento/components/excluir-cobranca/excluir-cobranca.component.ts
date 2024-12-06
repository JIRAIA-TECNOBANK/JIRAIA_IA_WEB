import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective, UntypedFormBuilder, Validators } from '@angular/forms';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { ConciliacaoItem } from '../../../../core/models/faturamento-conciliado/conciliacao-item.model';
import { TableConciliacao } from '../../../../core/models/faturamento-conciliado/table-conciliacao.model';
import { FaturamentoConciliadoService } from '../../../../services/faturamento-conciliado.service';

@Component({
  selector: 'app-excluir-cobranca',
  templateUrl: './excluir-cobranca.component.html',
  styleUrls: ['./excluir-cobranca.component.scss']
})
export class ExcluirCobrancaComponent implements OnInit {

  utility = Utility;

  item: TableConciliacao;
  formulario: FormGroup = this.fb.group({
    pesquisa: [null, Validators.required],
    valorPesquisa: [{ value: null, disabled: true }, Validators.required]
  });

  pesquisarPor: any[] = [
    { palavraChave: 'NCONTRATO', valor: 'Nº de contrato' },
    { palavraChave: 'CHASSI', valor: 'Chassi' }
  ];

  displayedColumns: string[] = [
    'selecionar',
    'chassi',
    'numeroContrato',
    'dataContrato',
    'tipoOperacao',
    'numeroGravame'
  ];
  conciliacaoItens: ConciliacaoItem[] = [];
  dataSource = new MatTableDataSource(this.conciliacaoItens);
  totalItens: number = 0;
  initialSelection = [];
  allowMultiSelect = true;
  selection = new SelectionModel<ConciliacaoItem>(
    this.allowMultiSelect,
    this.initialSelection
  );

  labelValorPesquisa: string = 'Informe a chave de pesquisa';

  @ViewChild('form') form: FormGroupDirective;

  constructor(public dialogRef: MatDialogRef<ExcluirCobrancaComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: UntypedFormBuilder,
    private faturamentoConciliadoService: FaturamentoConciliadoService,
    private notifierService: NotifierService) {
    this.item = <TableConciliacao>{
      id: data.id,
      empresa: data.empresa,
      clienteId: data.clienteId,
      uf: data.uf
    };
  }

  ngOnInit(): void {
    this.formulario.get('pesquisa').valueChanges.subscribe(value => {
      this.formulario.get('valorPesquisa').reset();

      if (value) {
        this.formulario.get('valorPesquisa').enable();
        this.labelValorPesquisa = value === 'NCONTRATO' ? 'Informe o n° de contrato' : 'Informe o n° do chassi';
        return;
      }

      this.formulario.get('valorPesquisa').disable();
      this.labelValorPesquisa = 'Informe a chave de pesquisa';
    })
  }

  desabilitarCheckboxSelecionarTodos() {
    return this.conciliacaoItens.length > 1;
  }

  desabilitarCheckbox(id: number) {
    return this.selection.selected?.length > 0 && this.selection.selected[0]?.id !== id;
  }

  pesquisar() {
    let chassi = this.formulario.get('pesquisa').value === 'CHASSI' ? this.formulario.get('valorPesquisa').value : null
    let numeroContrato = this.formulario.get('pesquisa').value === 'NCONTRATO' ? this.formulario.get('valorPesquisa').value : null
    this.conciliacaoItens = [];

    this.faturamentoConciliadoService.pesquisarItemConciliacao(this.item.id, chassi, numeroContrato).subscribe(response => {
      if (response?.faturamentoConciliadoItens) {
        if (response.faturamentoConciliadoItens.length > 0) {
          this.selection.clear();
          this.conciliacaoItens = response.faturamentoConciliadoItens;

          this.totalItens = this.conciliacaoItens.length;
          this.dataSource = new MatTableDataSource(this.conciliacaoItens);
          return;
        }

        this.notifierService.showNotification('Não há registro.', null, 'error');
        return;
      }

      this.notifierService.showNotification(response.errors[0].message, null, 'error');
    });
  }

}
