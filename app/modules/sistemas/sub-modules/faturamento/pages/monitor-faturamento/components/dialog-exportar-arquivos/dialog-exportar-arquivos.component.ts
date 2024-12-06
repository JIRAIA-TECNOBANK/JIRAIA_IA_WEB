import { Component } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';

@Component({
  selector: 'app-dialog-exportar-arquivos',
  templateUrl: './dialog-exportar-arquivos.component.html',
  styleUrls: ['./dialog-exportar-arquivos.component.scss']
})
export class DialogExportarArquivosComponent {

  utility = Utility;
  
  formulario = this.fb.group({
    tipo: [0, Validators.required],
  })

  constructor(private fb: UntypedFormBuilder) { }
}
