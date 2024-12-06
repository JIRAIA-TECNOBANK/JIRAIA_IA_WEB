import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import {
  closePreloader,
  showPreloader,
} from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { TipoRequisito } from '../../core/enums/tipo-requisito.enum';
import { AtualizarSenhaRequest } from '../../core/requests/atualizar-senha.request';
import { UsuariosEmpresaService } from '../../sub-modules/crm/services/usuarios-empresa.service';

@Component({
  selector: 'app-trocar-senha',
  templateUrl: './trocar-senha.component.html',
  styleUrls: ['./trocar-senha.component.scss'],
})
export class TrocarSenhaComponent implements OnInit {
  constructor(
    private formBuilder: UntypedFormBuilder,
    private usuarioEmpresaService: UsuariosEmpresaService,
    private authService: AuthService,
    private store: Store<{ preloader: IPreloaderState }>,
    private notifierService: NotifierService
  ) { }

  trocarSenhaForm = this.formBuilder.group({
    novaSenha: [
      null,
      Validators.compose([
        Validators.required,
        Utility.dynamicValidator(() => {
          return this.verificaTodosRequisitos();
        }, 'requisitos'),
      ]),
    ],
    confirmarSenha: [
      null,
      Validators.compose([
        Validators.required,
        Utility.dynamicValidator(() => {
          return (
            this.trocarSenhaForm?.get('novaSenha').value ==
            this.trocarSenhaForm?.get('confirmarSenha').value
          );
        }, 'naoCoincidem'),
      ]),
    ],
  });

  ngOnInit(): void {
    //
  }

  public getElementId(
    tipoElemento: number,
    nomeElemento: string,
    guidElemento: any = null
  ): string {
    return Utility.getElementId(
      <TipoElemento>tipoElemento,
      nomeElemento,
      guidElemento
    );
  }

  verificaTodosRequisitos() {
    let preencheRequisito = true;

    if (this.trocarSenhaForm?.get('novaSenha').value) {
      let tipos = Object.values(TipoRequisito).filter(
        (tipo) => !isNaN(Number(tipo))
      );
      tipos.forEach((tipo: number) => {
        if (!this.verificaRequisito(tipo)) {
          preencheRequisito = false;
          return;
        }
      });
    }

    return preencheRequisito;
  }

  verificaRequisito(requisito: TipoRequisito) {
    if (!this.trocarSenhaForm.get('novaSenha').value) return false;

    switch (requisito) {
      case TipoRequisito.MinMax:
        return (
          this.trocarSenhaForm.get('novaSenha').value.length >= 8 &&
          this.trocarSenhaForm.get('novaSenha').value.length <= 20
        );

      case TipoRequisito.CaseSensitivity:
        return (
          /[A-Z]/.test(this.trocarSenhaForm.get('novaSenha').value) &&
          /[a-z]/.test(this.trocarSenhaForm.get('novaSenha').value)
        );

      case TipoRequisito.SpecialChar:
        let pattern = /[!-#%-*,-\/:;?@_]/u;
        return pattern.test(this.trocarSenhaForm.get('novaSenha').value);

      case TipoRequisito.Number:
        return /\d/.test(this.trocarSenhaForm.get('novaSenha').value);
    }
  }

  onSubmit() {
    this.store.dispatch(showPreloader({ payload: '' }));
    let request: AtualizarSenhaRequest = <AtualizarSenhaRequest>{
      novaSenha: this.trocarSenhaForm.get('novaSenha').value,
      code: '', // Não tenho ideia do que seja esse code
    };

    this.usuarioEmpresaService.trocarSenha(request).subscribe((response) => {
      if (response.errors?.length > 0) {
        if (response.errors[0].propertyName == 'novaSenha') {
          this.notifierService.showNotification(
            response.errors[0].message,
            '',
            'error'
          );
          this.store.dispatch(closePreloader());
          return;
        }

        this.store.dispatch(closePreloader());
        return;
      }

      this.notifierService.showNotification(
        'Senha alterada com sucesso!.',
        'Sucesso',
        'success'
      );
      this.store.dispatch(closePreloader());
      this.authService.logout(true);
    });
  }

  updateConfirmaSenha() {
    this.trocarSenhaForm.get('confirmarSenha').updateValueAndValidity();
  }
}
