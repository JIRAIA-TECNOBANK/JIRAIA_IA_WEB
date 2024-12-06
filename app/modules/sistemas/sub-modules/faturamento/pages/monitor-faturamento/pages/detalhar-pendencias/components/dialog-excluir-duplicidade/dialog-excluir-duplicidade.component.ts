import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Utility } from 'src/app/core/common/utility';
import { MotivoExclusaoCobranca } from 'src/app/modules/sistemas/sub-modules/faturamento/core/models/faturamento-conciliado/motivo-exclusao-cobranca.model';
import { FaturamentoConciliadoService } from 'src/app/modules/sistemas/sub-modules/faturamento/services/faturamento-conciliado.service';

@Component({
  selector: 'app-dialog-excluir-duplicidade',
  templateUrl: './dialog-excluir-duplicidade.component.html',
  styleUrls: ['./dialog-excluir-duplicidade.component.scss']
})
export class DialogExcluirDuplicidadeComponent implements OnInit {

  utility = Utility;

  formulario = this.fb.group({
    motivo: [null, Validators.required],
    acao: [null, Validators.required]
  });

  duplicidade: boolean = true;
  mensagem: string;

  motivos: MotivoExclusaoCobranca[] = [];
  manterCobranca: number;

  constructor(public dialogRef: MatDialogRef<DialogExcluirDuplicidadeComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: UntypedFormBuilder,
    private faturamentoConciliacaoService: FaturamentoConciliadoService) {
    this.duplicidade = this.data.duplicidade
    this.mensagem = this.data.mensagem
  }

  ngOnInit(): void {
    this.carregarMotivosExclusao();

    this.formulario.get('motivo').valueChanges.subscribe(value => {
      let acao = 1;
      this.formulario.get('acao').reset();

      if (value == this.manterCobranca) {
        acao = 1;
        this.formulario.get('acao').patchValue(acao);
      }

      if (value === this.manterCobranca) { this.formulario.get('acao').disable(); }
      else { this.formulario.get('acao').enable(); }
    })
  }

  retornoTooltip(motivo) {
    return `${motivo.motivo} ${motivo?.textoAdicional || ''}`;
  }

  private carregarMotivosExclusao() {
    this.faturamentoConciliacaoService.oberMotivosExclusaoCobranca().subscribe(response => {
      if (response.motivoExclusao) {
        let listaMotivos = [];

        response.motivoExclusao.forEach(motivo => {
          if (motivo.motivo == 'Manter Cobrança') {
            this.manterCobranca = motivo.id;

            if (!this.duplicidade) return;
          }

          listaMotivos.push(motivo);
        });

        this.motivos = listaMotivos;
      }
    });
  }
}
