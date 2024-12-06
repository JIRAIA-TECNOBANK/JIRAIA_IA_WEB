import { Component, OnInit } from '@angular/core'
import { UntypedFormBuilder, Validators } from '@angular/forms'
import { Store } from '@ngrx/store'
import { Utility } from 'src/app/core/common/utility'
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions'
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer'
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service'
import { ActivatedRoute, Router } from '@angular/router'
import { Contato } from '../../core/model/contato.model'
import { ContatosService } from '../../services/contatos.service'

@Component({
  selector: 'app-criar-contatos',
  templateUrl: './criar-contatos.component.html',
  styleUrls: ['./criar-contatos.component.scss']
})
export class CriarContatosComponent implements OnInit {
  utility = Utility

  contatoId: number = null
  contato: Contato
  
  constructor(
    private formBuilder: UntypedFormBuilder,
    private store: Store<{ preloader: IPreloaderState }>,
    private contatosService: ContatosService,
    private notifierService: NotifierService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ){
    this.contatoId = this.activatedRoute.snapshot.params['idContato']
  }

  contatoForm = this.formBuilder.group({
    id: null,
    uf: ['', Validators.required],
    orgao: [''],
    cargo: [''],
    nome: [''],
    telefone: [''],
    email: [''],
  })

  ngOnInit(): void {
    if (this.contatoId != null) {
      this.store.dispatch(showPreloader({ payload: 'Carregando registro...' }))

      this.contatosService.consultarPorId(this.contatoId).subscribe({
        next: (contato: any) => {
          this.contato = contato
          
          this.contatoForm.setValue({
            id: this.contato.id,
            uf: this.contato.uf,
            orgao: this.contato.orgao,
            cargo: this.contato.cargo,
            nome: this.contato.nome,
            telefone: this.contato.telefone,
            email: this.contato.email,
          })
        },
        error: (err) => {
          this.notifierService.showNotification(JSON.stringify(err), "Erro ao carregar registro", "error")
        },
        complete: () => {
          this.store.dispatch(closePreloader())
        },
      })
    }
  }

  onSubmit(){
    this.store.dispatch(showPreloader({ payload: 'Incluindo registro...' }))

    let request = {   
      id: this.contatoForm.get('id').value,
      uf: this.contatoForm.get('uf').value,
      orgao: this.contatoForm.get('orgao').value,
      cargo: this.contatoForm.get('cargo').value,
      nome: this.contatoForm.get('nome').value,
      telefone: this.contatoForm.get('telefone').value,
      email: this.contatoForm.get('email').value,
    }

    if(this.contatoId){
      this.contatosService.editarContato(request, this.contatoId).subscribe({
        next: (resp) => {
          let response = JSON.parse(resp)
          if(!response.isSuccessful && response.errors?.length > 0){
            this.notifierService.showNotification(
              response.errors[0].message,
              "Erro ao editar contato",
              "error"
            )
          } else{
            this.notifierService.showNotification(
              "Contato editado com sucesso", 
              "Contato editado com sucesso", 
              "success"
            )
            this.router.navigate(['/registros'])
          }
        },
        error: (err) => {
          this.notifierService.showNotification(
            err.error, 
            "Erro ao editar registro", 
            "error"
          )
          this.store.dispatch(closePreloader())
        },
        complete: () => {
          this.store.dispatch(closePreloader())
        },
      })
    } 
    
    else {
      this.contatosService.cadastrarContato(request).subscribe({
        next: (resp) => {
          let response = JSON.parse(resp)
          if(!response.isSuccessful && response.errors?.length > 0){
            this.notifierService.showNotification(
              response.errors[0].message, 
              "Erro ao incluir contato", 
              "error"
            )
          } else{
            this.notifierService.showNotification(
              "Contato incluido com sucesso", 
              "Contato incluido com sucesso", 
              "success"
            )
            this.router.navigate(['/registros'])
          }
        },
        error: (err) => {
          this.notifierService.showNotification(
            err.error, 
            "Erro ao incluir contato", 
            "error"
          )
          this.store.dispatch(closePreloader())
        },
        complete: () => {
          this.store.dispatch(closePreloader())
        },
      })
    }
  }
}

