import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, FormControl, Validators } from '@angular/forms';
import { MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent } from '@angular/material/legacy-autocomplete';
import { MatLegacyChipInputEvent as MatChipInputEvent } from '@angular/material/legacy-chips';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';
import { chipsEmailModel } from '../../../../core/models/empresas/chips-email-model';
import { EmpresasService } from '../../../../services/empresas.service';
import { UsuariosEmpresaService } from '../../../../services/usuarios-empresa.service';

@Component({
  selector: 'app-dialog-enviar-credenciais',
  templateUrl: './dialog-enviar-credenciais.component.html',
  styleUrls: ['./dialog-enviar-credenciais.component.scss']
})
export class DialogEnviarCredenciaisComponent implements OnInit {

  formulario = this.formBuilder.group({
    emails: [null, Validators.email]
  })

  constructor(private dialogService: DialogCustomService, private formBuilder: UntypedFormBuilder) {
    this.dialogService.setDialogData('nodata');
  }

  ngOnInit(): void {
    this.dialogService.setDialogData("nodata");
  }

  selectable = false;
  removable = true;
  addOnBlur = false;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  emails: Array<string> = [];

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add e-mail
    if (value && this.formulario.controls['emails'].valid) {
      this.emails.push(value);

      this.dialogService.setDialogData({ dataType: 'envioEmail', data: { emails: this.emails } });

      // Clear the input value
      event.chipInput!.clear();
    }
  }

  remove(email: string): void {
    const index = this.emails.indexOf(email);

    if (index >= 0) {
      this.emails.splice(index, 1);
    }

    if (this.emails.length == 0) {
      this.dialogService.setDialogData('nodata')
    }
  }

}
