import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Utility } from 'src/app/core/common/utility';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { GarantiasService } from '../../services/garantias.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { ActivatedRoute, Router } from '@angular/router';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { Registro } from '../../core/model/registro.model';

@Component({
  selector: 'app-criar-garantia',
  templateUrl: './criar-garantia.component.html',
  styleUrls: ['./criar-garantia.component.scss']
})
export class CriarGarantiaComponent implements OnInit {
  utility = Utility;
  
  garantiaId: number = null;
  garantia: Registro;
  
  constructor(
    private formBuilder: UntypedFormBuilder,
    private store: Store<{ preloader: IPreloaderState }>,
    private garantiasService: GarantiasService,
    private notifierService: NotifierService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ){
    this.garantiaId = this.activatedRoute.snapshot.params['idGarantia'];
  }

  garantiaForm = this.formBuilder.group({
    id: null,
    uf: ['', Validators.required],
    tipoRegistro: [''],
    valorPublico: [''],
    valorPrivado: [''],
    valorTotal: [''],
    observacao: [''],
  });

  ngOnInit(): void {
    if (this.garantiaId != null) {

      this.store.dispatch(showPreloader({ payload: 'Carregando registro...' }));

      this.garantiasService.consultarGarantiaPorId(this.garantiaId).subscribe({
        next: (value: any) => {
          this.garantia = value.result;
          
          this.garantiaForm.setValue({
            id: this.garantia.id,
            uf: this.garantia.uf,
            tipoRegistro: this.garantia.tipoRegistro,
            valorPublico: this.garantia.valorPublico,
            valorPrivado: this.garantia.valorPrivado,
            valorTotal: this.garantia.valorTotal,
            observacao: this.garantia.observacao
          });
        },
        error: (err) => {
          this.notifierService.showNotification(JSON.stringify(err), "Erro ao carregar garantia", "error");
        },
        complete: () => {
          this.store.dispatch(closePreloader());
        },
      });
    }
  }

  onSubmit(){
    this.store.dispatch(showPreloader({ payload: 'Incluindo garantia...' }));

    let request = {
      id: this.garantiaForm.get('id').value,
      uf: this.garantiaForm.get('uf').value,
      tipoRegistro: this.garantiaForm.get('tipoRegistro').value,
      valorPublico: this.garantiaForm.get('valorPublico').value,
      valorPrivado: this.garantiaForm.get('valorPrivado').value,
      valorTotal: this.garantiaForm.get('valorTotal').value,
      observacao: this.garantiaForm.get('observacao').value,
    };

    if(this.garantiaId){
      this.garantiasService.editarGarantia(request, this.garantiaId).subscribe({
        next: (resp) => {
          let response = JSON.parse(resp);
          if(!response.isSuccessful && response.errors?.length > 0){
            this.notifierService.showNotification(response.errors[0].message, "Erro ao editar garantia", "error");
          } else{
            this.notifierService.showNotification("Garantia editada com sucesso", "Garantia editada com sucesso", "success");
            this.router.navigate(['/registros']);
          }
        },
        error: (err) => {
          this.notifierService.showNotification(err.error, "Erro ao editar garantia", "error");
          this.store.dispatch(closePreloader());
        },
        complete: () => {
          this.store.dispatch(closePreloader());
        },
      });
    } else {
      this.garantiasService.cadastrarGarantia(request).subscribe({
        next: (resp) => {
          let response = JSON.parse(resp);
          if(!response.isSuccessful && response.errors?.length > 0){
            this.notifierService.showNotification(response.errors[0].message, "Erro ao incluir garantia", "error");
          } else{
            this.notifierService.showNotification("Garantia incluido com sucesso", "Garantia incluido com sucesso", "success");
            this.router.navigate(['/registros']);
          }
        },
        error: (err) => {
          this.notifierService.showNotification(err.error, "Erro ao incluir garantia", "error");
          this.store.dispatch(closePreloader());
        },
        complete: () => {
          this.store.dispatch(closePreloader());
        },
      });
    }
  }
}
