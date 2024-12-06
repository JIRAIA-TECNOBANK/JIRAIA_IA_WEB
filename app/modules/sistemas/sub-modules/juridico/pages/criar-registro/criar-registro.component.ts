import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Utility } from 'src/app/core/common/utility';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { RegistrosService } from '../../services/registros.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Registro } from '../../core/model/registro.model';

@Component({
  selector: 'app-criar-registro',
  templateUrl: './criar-registro.component.html',
  styleUrls: ['./criar-registro.component.scss']
})
export class CriarRegistroComponent implements OnInit {
  utility = Utility;

  registroId: number = null;
  registro: Registro;
  
  constructor(
    private formBuilder: UntypedFormBuilder,
    private store: Store<{ preloader: IPreloaderState }>,
    private registrosService: RegistrosService,
    private notifierService: NotifierService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ){
    this.registroId = this.activatedRoute.snapshot.params['idRegistro'];
  }

  registroForm = this.formBuilder.group({
    id: null,
    uf: ['', Validators.required],
    tipoRegistro: [''],
    valorPublico: [''],
    valorPrivado: [''],
    valorTotal: [''],
    observacao: [''],
  });

  ngOnInit(): void {
    if (this.registroId != null) {

      this.store.dispatch(showPreloader({ payload: 'Carregando registro...' }));

      this.registrosService.consultarRegistroPorId(this.registroId).subscribe({
        next: (value: any) => {
          this.registro = value.result;
          
          this.registroForm.setValue({
            id: this.registro.id,
            uf: this.registro.uf,
            tipoRegistro: this.registro.tipoRegistro,
            valorPublico: this.registro.valorPublico,
            valorPrivado: this.registro.valorPrivado,
            valorTotal: this.registro.valorTotal,
            observacao: this.registro.observacao
          });
        },
        error: (err) => {
          this.notifierService.showNotification(JSON.stringify(err), "Erro ao carregar registro", "error");
        },
        complete: () => {
          this.store.dispatch(closePreloader());
        },
      });
    }
  }

  onSubmit(){
    this.store.dispatch(showPreloader({ payload: 'Incluindo registro...' }));

    let request = {
      id: this.registroForm.get('id').value,
      uf: this.registroForm.get('uf').value,
      tipoRegistro: this.registroForm.get('tipoRegistro').value,
      valorPublico: this.registroForm.get('valorPublico').value,
      valorPrivado: this.registroForm.get('valorPrivado').value,
      valorTotal: this.registroForm.get('valorTotal').value,
      observacao: this.registroForm.get('observacao').value,
    };

    if(this.registroId){
      this.registrosService.editarRegistro(request, this.registroId).subscribe({
        next: (resp) => {
          let response = JSON.parse(resp);
          if(!response.isSuccessful && response.errors?.length > 0){
            this.notifierService.showNotification(response.errors[0].message, "Erro ao editar registro", "error");
          } else{
            this.notifierService.showNotification("Registro editado com sucesso", "Registro editado com sucesso", "success");
            this.router.navigate(['/registros']);
          }
        },
        error: (err) => {
          this.notifierService.showNotification(err.error, "Erro ao editar registro", "error");
          this.store.dispatch(closePreloader());
        },
        complete: () => {
          this.store.dispatch(closePreloader());
        },
      });
    } else {
      this.registrosService.cadastrarRegistro(request).subscribe({
        next: (resp) => {
          let response = JSON.parse(resp);
          if(!response.isSuccessful && response.errors?.length > 0){
            this.notifierService.showNotification(response.errors[0].message, "Erro ao incluir registro", "error");
          } else{
            this.notifierService.showNotification("Registro incluido com sucesso", "Registro incluido com sucesso", "success");
            this.router.navigate(['/registros']);
          }
        },
        error: (err) => {
          this.notifierService.showNotification(err.error, "Erro ao incluir registro", "error");
          this.store.dispatch(closePreloader());
        },
        complete: () => {
          this.store.dispatch(closePreloader());
        },
      });
    }

  }

}
