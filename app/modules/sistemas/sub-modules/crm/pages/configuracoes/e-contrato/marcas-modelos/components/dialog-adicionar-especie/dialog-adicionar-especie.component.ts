import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { Especie } from 'src/app/modules/sistemas/sub-modules/crm/core/models/veiculos/especie.model';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-dialog-adicionar-especie',
  templateUrl: './dialog-adicionar-especie.component.html',
  styleUrls: ['./dialog-adicionar-especie.component.scss']
})
export class DialogAdicionarEspecieComponent {
  utility = Utility;

  formulario = this.fb.group({
    id: [null],
    nome: [{ value: null, disabled: false }, Validators.required]
  });
  especie: Especie;

  constructor(private fb: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: Especie) {
    this.especie = data;
    if (data) {
      this.formulario.get("id").patchValue(data.id);
      this.formulario.get("nome").patchValue(data.nome);
    }
  }
}
