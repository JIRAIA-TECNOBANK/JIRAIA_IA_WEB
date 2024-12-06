import { Component, OnInit } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { FormControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { Store } from '@ngrx/store';
import { InstituicaoFinanceiraService } from '../../services/instituicao-financeira.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { Instituicao } from '../../core/model/instituicao-financeira.model';

@Component({
  selector: 'app-criar-instituicao',
  templateUrl: './criar-instituicao.component.html',
  styleUrls: ['./criar-instituicao.component.scss']
})
export class CriarInstituicaoComponent implements OnInit {
  utility = Utility;
  instituicaoId: number = null;
  instituicao: Instituicao;

  criarNovoDocumento: boolean = false
  documentoControl = new FormControl('');
  documentosSelecionados: string[] = [];
  documentosFiltrados: string[] = [];

  constructor(
    private formBuilder: UntypedFormBuilder,
    private store: Store<{ preloader: IPreloaderState }>,
    private instituicaoService: InstituicaoFinanceiraService,
    private notifierService: NotifierService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ){
    this.instituicaoId = this.activatedRoute.snapshot.params['idInstituicao'];
  }

  instituicaoForm = this.formBuilder.group({
    id: null,
    uf: ['', Validators.required],
    precoCadastro: [''],
    precoRenovacaoCadastro: [''],
    periodicidade: [''],
    observacoes: [''],
    documentos: [''],
  });

  ngOnInit(): void {
    if (this.instituicaoId != null) {
      this.store.dispatch(showPreloader({ payload: 'Carregando instituicao...' }));
  
      this.instituicaoService.consultarInstituicaoPorId(this.instituicaoId).subscribe({
        next: (value: any) => {
          this.instituicao = value.result;  
          this.documentosSelecionados = this.instituicao.documentos.map((doc: any) => doc.documento);
  
          this.instituicaoForm.patchValue({
            uf: this.instituicao.uf,
            precoCadastro: this.instituicao.precoCadastro,
            precoRenovacaoCadastro: this.instituicao.precoRenovacaoCadastro,
            periodicidade: this.instituicao.periodicidade,
            observacoes: this.instituicao.observacoes,
            documentos: this.documentosSelecionados 
          });
        },
        error: (err) => {
          this.notifierService.showNotification(JSON.stringify(err), "Erro ao carregar instituição", "error");
        },
        complete: () => {
          this.store.dispatch(closePreloader());
        },
      });
    }
  }

  onInput(value: string) {
    this.documentosFiltrados = this.documentosSelecionados
      .filter(doc => doc.toLowerCase().includes(value.toLowerCase()));
  
    const documentoJaExiste = this.documentosSelecionados
      .some(doc => doc.toLowerCase() === value.toLowerCase());
  
    this.criarNovoDocumento = !documentoJaExiste && value.length > 0;
  }

  selectDocumento(doc: string) {
    this.documentoControl.setValue(doc);
    this.documentosFiltrados = [];
    this.criarNovoDocumento = false;
    this.adicionarNovoItem(doc);
  }

  adicionarNovoItem(novoDocumento: string) {
    if (novoDocumento && !this.documentosSelecionados.includes(novoDocumento)) {
      this.documentosSelecionados.push(novoDocumento);
      this.documentoControl.reset();
      this.criarNovoDocumento = false;

      this.instituicaoForm.get('documentos').setValue(this.documentosSelecionados);
    }
  }

  removerDocumento(documento: string) {
    this.documentosSelecionados = this.documentosSelecionados.filter(doc => doc !== documento);
    this.instituicaoForm.get('documentos').setValue(this.documentosSelecionados);
  }

  onSubmit(){
    this.store.dispatch(showPreloader({ payload: 'Incluindo instituição...' }));

    let request = {
      id: this.instituicaoForm.get('id').value,
      uf: this.instituicaoForm.get('uf').value,
      precoCadastro: this.instituicaoForm.get('precoCadastro').value,
      precoRenovacaoCadastro: this.instituicaoForm.get('precoRenovacaoCadastro').value,
      periodicidade: this.instituicaoForm.get('periodicidade').value,
      observacoes: this.instituicaoForm.get('observacoes').value,
      documentos: null
    };

    if(this.instituicaoId){
      const documentosFormatados = this.documentosSelecionados.map(doc => ({
        documento: doc
      }));

      request.documentos = documentosFormatados;
      this.instituicaoService.editarInstituicao(request, this.instituicaoId).subscribe({
        next: (resp) => {
          let response = JSON.parse(resp);

          if(!response.isSuccessful && response.errors?.length > 0){
            this.notifierService.showNotification(response.errors[0].message, "Erro ao editar instituição", "error");
          } else{
            this.notifierService.showNotification("Instituição editada com sucesso", "Instituição editada com sucesso", "success");
            this.router.navigate(['/registros']);
          }
        },
        error: (err) => {
          this.notifierService.showNotification(err.error, "Erro ao editar instituição", "error");
          this.store.dispatch(closePreloader());
        },
        complete: () => {
          this.store.dispatch(closePreloader());
        },
      });
    } else {
      request.documentos = this.documentosSelecionados,

      this.instituicaoService.cadastrarInstituicao(request).subscribe({
        next: (resp) => {
          let response = JSON.parse(resp);

          if(!response.isSuccessful && response.errors?.length > 0){
            this.notifierService.showNotification(response.errors[0].message, "Erro ao incluir instituição", "error");
          } else{
            this.notifierService.showNotification("Instituição incluido com sucesso", "Instituição incluido com sucesso", "success");
            this.router.navigate(['/registros']);
          }
        },
        error: (err) => {
          this.notifierService.showNotification(err.error, "Erro ao incluir instituição", "error");
          this.store.dispatch(closePreloader());
        },
        complete: () => {
          this.store.dispatch(closePreloader());
        },
      });
    }
  }
}
