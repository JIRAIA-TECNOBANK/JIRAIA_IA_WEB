import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Utility } from 'src/app/core/common/utility';
import { PrecoTbk } from '../../../../core/models/preco/preco-tbk.model';

@Component({
  selector: 'app-dialog-editar-vigencia-cesta',
  templateUrl: './dialog-editar-vigencia-cesta.component.html',
  styleUrls: ['./dialog-editar-vigencia-cesta.component.scss']
})
export class DialogEditarVigenciaCestaComponent {

  utility = Utility;
  formulario = this.fb.group({
    periodoVigencia: [null, Validators.required],
    dataInicioVigencia: [new Date(), Validators.required]
  });

  preco: PrecoTbk;

  constructor(private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data) {
    if (data.preco) {
      this.preco = data.preco;
    }
  }
}
