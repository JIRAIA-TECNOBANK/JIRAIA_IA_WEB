import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { Cor } from 'src/app/modules/sistemas/sub-modules/crm/core/models/veiculos/cor.model';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-dialog-adicionar-cor',
  templateUrl: './dialog-adicionar-cor.component.html',
  styleUrls: ['./dialog-adicionar-cor.component.scss']
})
export class DialogAdicionarCorComponent {

  utility = Utility;

  formulario = this.fb.group({
    id: [null],
    nome: [{ value: null, disabled: false }, Validators.required]
  });
  cor: Cor;

  constructor(private fb: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: Cor) {
    this.cor = data;
    if (data) {
      this.formulario.get("id").patchValue(data.id);
      this.formulario.get("nome").patchValue(data.nome);
    }
  }
}
