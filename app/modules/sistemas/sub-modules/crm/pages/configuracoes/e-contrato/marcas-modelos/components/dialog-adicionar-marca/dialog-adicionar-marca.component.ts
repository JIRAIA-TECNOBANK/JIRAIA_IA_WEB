import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { Marcas } from 'src/app/modules/sistemas/sub-modules/crm/core/models/veiculos/marcas.model';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-dialog-adicionar-marca',
  templateUrl: './dialog-adicionar-marca.component.html',
  styleUrls: ['./dialog-adicionar-marca.component.scss']
})
export class DialogAdicionarMarcaComponent {
  utility = Utility;

  formulario = this.fb.group({
    id: [null],
    nome: [{ value: null, disabled: false }, Validators.required]
  });
  marca: Marcas

  constructor(private fb: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: Marcas) {
    this.marca = data;
    if (data) {
      this.formulario.get("id").patchValue(data.id);
      this.formulario.get("nome").patchValue(data.nome);
    }
  }
}
