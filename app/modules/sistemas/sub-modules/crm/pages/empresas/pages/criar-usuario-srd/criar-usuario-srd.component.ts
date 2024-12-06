import { Component } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { UsuarioServico } from '../../../../core/models/usuario-servico/usuario-servico.model';
import { UsuarioServicoService } from '../../../../services/usuario-servico.service';

@Component({
  selector: 'app-criar-usuario-srd',
  templateUrl: './criar-usuario-srd.component.html',
  styleUrls: ['./criar-usuario-srd.component.scss']
})
export class CriarUsuarioSrdComponent {
  Permissoes = Permissoes;
  utility = Utility;

  createUsuarioForm = this.formBuilder.group({
    nome: '',
    sobrenome: '',
    email: ['', Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")],
    confirmacaoEmail: ['', Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")],
  });

  empresaId: number;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private activatedRoute: ActivatedRoute,
    private usuarioServicoService: UsuarioServicoService,
    private notifierService: NotifierService,
    private store: Store<{ preloader: IPreloaderState }>,
    private router: Router
  ) {
    this.empresaId = +this.activatedRoute.parent.params['_value']['empresaId'];
  }

  verificaConfirmacaoEmail(confirmacaoEmail: string) {
    this.createUsuarioForm.get('confirmacaoEmail').setValidators(Validators.compose([
      Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"),
      Validators.required,
      Utility.dynamicValidator(() => { return confirmacaoEmail == this.createUsuarioForm.get('email').value; }, "EmailDiferente")
    ]));

    this.createUsuarioForm.get('confirmacaoEmail').updateValueAndValidity();
    this.habilitaCampos();
  }

  submitUsuario() {
    this.store.dispatch(showPreloader({ payload: '' }));

    let usuario: UsuarioServico = <UsuarioServico>{
      empresaId: this.empresaId,
      email: this.createUsuarioForm.get('email').value,
      nome: this.createUsuarioForm.get('nome').value,
      sobrenome: this.createUsuarioForm.get('sobrenome').value
    }

    this.usuarioServicoService.incluirUsuarioServicoSrd(usuario).subscribe({
      next: (response) => {
        if (response.id) {
          this.notifierService.showNotification('Usuário SRD criado com sucesso.', 'Sucesso', 'success');
          this.router.navigate(['../../', this.empresaId], { relativeTo: this.activatedRoute });
        }
      },
      error: (error) => {
        this.notifierService.showNotification(error.mensagem, null, 'error');
      },
      complete: () => {
        this.store.dispatch(closePreloader())
      }
    })
  }

  private habilitaCampos() {
    Object.keys(this.createUsuarioForm.controls).forEach((control) => {
      if (control == 'email') return;
      this.createUsuarioForm.get(control).enable()
    });
  }
}
