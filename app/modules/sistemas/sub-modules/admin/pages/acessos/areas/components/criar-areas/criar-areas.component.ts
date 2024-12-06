import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { AreasService } from '../../../../../../crm/services/areas.service';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { Utility } from 'src/app/core/common/utility';

import { Store } from '@ngrx/store';
import { debounceTime } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Area } from '../../../../../core/models/areas/areas.model';

@Component({
  selector: 'app-criar-areas',
  templateUrl: './criar-areas.component.html',
  styleUrls: ['./criar-areas.component.scss']
})
export class CriarAreasComponent implements OnInit {

  formularioCriarArea: FormGroup;
  exibeErroNome: boolean = false;
  exibeErroEmail: boolean = false;
  areaId: number = null;

  constructor(
    private fb: UntypedFormBuilder,
    private areasService: AreasService,
    private notifierService: NotifierService,
    private store: Store<{ preloader: IPreloaderState }>,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.areaId = this.activatedRoute.snapshot.params['areaId'];
  }

  ngOnInit(): void {
    this.initForm()

    if (!this.areaId) {
      this.formularioCriarArea.get('nomeArea').valueChanges
        .pipe(debounceTime(1000))
        .subscribe((item) => {
          if (item) this.exibeErroNome = false
        })
      this.formularioCriarArea.get('emailArea').valueChanges
        .pipe(debounceTime(1000))
        .subscribe((item) => {
          if (item) this.exibeErroEmail = false
        })
    }

    if (this.areaId) this.carregaDadosArea()
  }

  private initForm() {
    this.formularioCriarArea = this.fb.group({
      nomeArea: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(50), Validators.required])],
      emailArea: ['', Validators.compose([Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"), Utility.isValidEmailTBK()])],
      ativo: true
    })
  }

  public submitForm(): void {
    if (this.formularioCriarArea.invalid) return
    let area = {
      nome: this.formularioCriarArea.controls['nomeArea'].value,
      email: this.formularioCriarArea.controls['emailArea'].value,
      descricao: null,
      ativo: this.formularioCriarArea.controls['ativo'].value
    }

    this.store.dispatch(showPreloader({ payload: '' }))

    if (!this.areaId) {
      this.incluirArea(area);
      return
    }

    this.atualizarArea(area);
  }

  getError(errors: any) {
    for (const error of errors) {
      let message = error.message;

      Utility.waitFor(() => {
        switch (error.propertyName) {
          case "Nome":
            this.exibeErroNome = true;
            message = 'Área já cadastrada no sistema';
            break;

          case "Email":
            this.exibeErroEmail = true
            message = 'E-mail já cadastrado no sistema';
            break;

          default:
            break;
        }
        this.notifierService.showNotification(message, null, 'error')
      }, 1000)
    }
  }

  carregaDadosArea() {
    this.areasService.obterAreaId([+this.areaId]).subscribe(
      response => {
        this.formularioCriarArea.setValue({
          nomeArea: response.nome,
          emailArea: response.email,
          ativo: response.ativo
        })
      }
    )
  }

  private incluirArea(area: Area) {
    this.areasService.incluirArea(area).subscribe(
      response => {
        if (response.isSuccessful) {
          this.exibeErroNome = false;
          this.exibeErroEmail = false;

          this.store.dispatch(closePreloader());
          this.notifierService.showNotification('Área criada com sucesso!', 'Sucesso', 'success')

          this.initForm();
          this.router.navigate(['../../areas'], { relativeTo: this.activatedRoute });
          return;
        }

        this.store.dispatch(closePreloader())
        this.getError(response.errors)
      },
      error => {
        this.store.dispatch(closePreloader())

        let message = error.error.errors[0].message;
        if (error.error.errors[0].propertyName == 'Nome') { message = 'Área já cadastrada no sistema'; }
        this.notifierService.showNotification(message, null, 'error')
      }
    )
  }

  private atualizarArea(area: Area) {
    this.areasService.atualizarArea(this.areaId, area).subscribe(
      response => {
        if (response.isSuccessful) {
          this.store.dispatch(closePreloader())
          this.notifierService.showNotification('Área atualizada com sucesso!', 'Sucesso', 'success')
          this.router.navigate(['../../../areas'], { relativeTo: this.activatedRoute });
          return;
        }

        this.store.dispatch(closePreloader())
        this.getError(response.errors)
      },
      error => {
        this.store.dispatch(closePreloader())
        let message = error.error.errors[0].message;
        if (error.error.errors[0].propertyName == 'Nome') { message = 'Área já cadastrada no sistema'; }
        this.notifierService.showNotification(message, null, 'error')
      }
    )
  }
}
