import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';
import { UsuariosEmpresaService } from '../../../../services/usuarios-empresa.service';

@Component({
  selector: 'app-definicao-senha',
  templateUrl: './definicao-senha.component.html',
  styleUrls: ['./definicao-senha.component.scss']
})
export class DefinicaoSenhaComponent implements OnInit {

  email: string = '';
  resetarSenhaForm = this.formBuilder.group({
    resetarSenha: [null, Validators.required]
  });

  constructor(
    private usuarioEmpresaService: UsuariosEmpresaService,
    private formBuilder: UntypedFormBuilder,
    private dialogService: DialogCustomService
  ) { }

  ngOnInit(): void {
    this.dialogService.setDialogData("nodata");

    this.usuarioEmpresaService.email$.subscribe(response => {
      this.email = response != null ? response : '';
    });

    this.resetarSenhaForm.statusChanges.subscribe((sub) => {
      if (sub == 'VALID') {
        Utility.waitFor(() => {
          this.dialogService.setDialogData({ dataType: 'resetarEmail', data: { resetarSenha: this.resetarSenhaForm.get('resetarSenha').value } });
        }, 300)
      } else {
        this.dialogService.setDialogData("nodata");
      }
    })
    
    this.resetarSenhaForm.get('resetarSenha').setValue(1);
  }
}
