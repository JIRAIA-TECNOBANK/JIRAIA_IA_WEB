import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { CriarSecaoRequest } from 'src/app/modules/sistemas/sub-modules/crm/core/requests/central-ajuda/criar-secao.request';
import { CentralAjudaService } from 'src/app/modules/sistemas/sub-modules/crm/services/central-ajuda.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { showPreloader, closePreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';

@Component({
  selector: 'app-criar-secao',
  templateUrl: './criar-secao.component.html',
  styleUrls: ['./criar-secao.component.scss']
})
export class CriarSecaoComponent implements OnInit {

  constructor(private fb: UntypedFormBuilder,
    private notifierService: NotifierService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private centralAjudaService: CentralAjudaService,
    private store: Store<{ preloader: IPreloaderState }>) {
    this.secaoId = this.activatedRoute.snapshot.params['secaoId'];
  }

  utility = Utility;
  Permissoes = Permissoes;
  formulario: FormGroup;
  secaoId: number = null;

  ngOnInit(): void {
    this.initializeForm();
    if (this.secaoId) {
      this.store.dispatch(showPreloader({ payload: '' }));
      this.carregaSecao();
    }

    if (!Utility.getPermission([Permissoes.GESTAO_CENTRAL_AJUDA_CADASTRAR])) {
      Utility.modoConsulta(this.formulario);
    }
  }

  onClickConfirmar() {
    if (!this.formulario.valid) return;

    this.store.dispatch(showPreloader({ payload: '' }));
    this.submitSecao();
  }

  private initializeForm() {
    this.formulario = this.fb.group({
      id: [null],
      titulo: [null, Validators.compose([Validators.required, Validators.maxLength(150)])],
      descricao: [null, Validators.maxLength(150)],
    });
  }

  private submitSecao() {
    let secao: CriarSecaoRequest = {
      titulo: this.formulario.get('titulo').value,
      descricao: this.formulario.get('descricao').value
    };

    if (this.secaoId) {
      this.editarSecao(secao);
      return;
    }

    this.criarSecao(secao);
  }

  private criarSecao(secao: CriarSecaoRequest) {
    this.centralAjudaService.criarSecao(secao).subscribe(response => {
      if (response.id) {
        this.store.dispatch(closePreloader());
        this.voltar();
        this.notifierService.showNotification('Seção cadastrada com sucesso!', '', 'success');
        return;
      }

      this.store.dispatch(closePreloader());
      this.notifierService.showNotification(response.errors[0].message, '', 'error');
    });
  }

  private editarSecao(secao: CriarSecaoRequest) {
    this.centralAjudaService.editarSecao(this.secaoId, secao).subscribe(response => {
      if (response.id) {
        this.store.dispatch(closePreloader());
        this.voltar();
        this.notifierService.showNotification('Seção editada com sucesso!', '', 'success');
        return;
      }

      this.store.dispatch(closePreloader());
      this.notifierService.showNotification(response.errors[0].message, '', 'error');
    });
  }

  private carregaSecao() {
    this.centralAjudaService.obterSecaoPorId(this.secaoId).subscribe(response => {
      this.formulario.patchValue({
        id: response.id,
        titulo: response.titulo,
        descricao: response.descricao
      });

      this.store.dispatch(closePreloader());
    })
  }

  private voltar() {
    if (this.secaoId) {
      this.router.navigate([`../../`], { relativeTo: this.activatedRoute });
      return;
    }

    this.router.navigate([`../`], { relativeTo: this.activatedRoute });
  }
}
