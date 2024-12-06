import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AplicacoesService } from '../../../services/aplicacoes.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { Clipboard } from '@angular/cdk/clipboard';
import { Utility } from 'src/app/core/common/utility';

@Component({
  selector: 'app-aplicacoes-register',
  templateUrl: './aplicacoes-register.component.html',
  styleUrls: ['./aplicacoes-register.component.scss']
})
export class AplicacoesRegisterComponent implements OnInit {
  callbackSecretKey: string | null = null;
  createAplicacaoForm = this.formBuilder.group({
    nome: ['', [Validators.required]],
    callbackUrl: ['', [Validators.required]],
    ativo: [true]
  });
  copiado: boolean = false;
  aplicacaoId: string | null = null;
  credenciais: { chavePublica: string, chavePrivada: string }[] | null = null;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private produtoAplicacoesService: AplicacoesService,
    private router: Router,
    private route: ActivatedRoute,
    private notifierService: NotifierService,
    private store: Store,
    private clipboard: Clipboard
  ) { }

  ngOnInit(): void {
    this.aplicacaoId = this.route.snapshot.paramMap.get('id');
    if (this.aplicacaoId) {
      this.carregarAplicacao(this.aplicacaoId);
      this.carregarCredenciais(this.aplicacaoId);
    }
  }

  carregarAplicacao(id: string) {
    this.store.dispatch(showPreloader({ payload: '' }));
    this.produtoAplicacoesService.obterAplicacaoPorId(id).subscribe(aplicacao => {
      this.createAplicacaoForm.patchValue(aplicacao);
      this.callbackSecretKey = aplicacao.callbackSecretKey;
      this.store.dispatch(closePreloader());
    });
  }

  carregarCredenciais(id: string) {
    this.produtoAplicacoesService.obterCredenciais(id).subscribe(
      (credenciais) => {
        this.credenciais = credenciais;
      },
      (error) => {
        console.error('Erro ao carregar credenciais:', error);
      }
    );
  }

  submitAplicacao() {
    if (this.createAplicacaoForm.invalid) {
      return;
    }

    const aplicacao = this.createAplicacaoForm.value;
    this.store.dispatch(showPreloader({ payload: '' }));

    if (this.aplicacaoId) {
      this.produtoAplicacoesService.atualizarAplicacao(this.aplicacaoId, aplicacao).subscribe(
        () => {
          this.notifierService.showNotification('Aplicacao atualizado com sucesso.', 'Sucesso', 'success');
          this.store.dispatch(closePreloader());
          this.carregarAplicacao(this.aplicacaoId);
        },
        (error) => {
          this.store.dispatch(closePreloader());
          this.notifierService.showNotification(`${error.error[0].message}`, 'Erro', 'error');
        }
      );
    } else {
      this.produtoAplicacoesService.criarAplicacao(aplicacao).subscribe(
        (response) => {
          this.notifierService.showNotification('Aplicacao criado com sucesso.', 'Sucesso', 'success');
          this.store.dispatch(closePreloader());
          this.aplicacaoId = response.id.toString();
          this.carregarAplicacao(this.aplicacaoId);
          this.carregarCredenciais(this.aplicacaoId);
        },
        (error) => {
          this.store.dispatch(closePreloader());
          this.notifierService.showNotification(`${error.error[0].message}`, 'Erro', 'error');
        }
      );
    }
  }

  copiarMsg(mensagem: string) {
    this.clipboard.copy(mensagem);
    this.copiado = true;
    Utility.waitFor(() => { this.copiado = false; }, 1000);
  }
}
