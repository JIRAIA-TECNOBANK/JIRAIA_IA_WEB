import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { ParametrizacaoDudaRequest } from '../../../../core/requests/taxas/parametrizacao-duda.request';
import { TaxasService } from '../../../../services/taxas.service';


@Component({
  selector: 'app-form-parametrizar-duda',
  templateUrl: './form-parametrizar-duda.component.html',
  styleUrls: ['./form-parametrizar-duda.component.scss']
})
export class FormParametrizarDudaComponent implements OnInit {

  utility = Utility;
  parametrizaDudaId: number = null;
  cnpjEmpresa: string = null;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private store: Store<{ preloader: IPreloaderState }>,
    private notifierService: NotifierService,
    private taxaService: TaxasService,
    private router: Router
  ) {
    this.parametrizaDudaId = this.activatedRoute.snapshot.params['empresaId'];
    this.cnpjEmpresa = this.router.getCurrentNavigation()?.extras?.state?.cnpj;
  }

  parametrizarDudaForm = this.formBuilder.group({
    cnpj: [{ value: '', disabled: true }],
    estoque: [{ value: 0 }, Validators.required]
  });

  ngOnInit(): void {
    this.getDudaPorId(this.parametrizaDudaId);

    if (!this.cnpjEmpresa) {
      this.router.navigate([`/gestao-dudas`]);
    }
  }

  ngAfterViewInit() {
  }

  submitParametrizacaoDuda() {
    let parametrizacaoDudaRequest = <ParametrizacaoDudaRequest>{
      estoque: this.parametrizarDudaForm.get('estoque').value
    };

    this.store.dispatch(showPreloader({ payload: '' }))

    this.taxaService.parametrizarDuda(this.parametrizaDudaId, parametrizacaoDudaRequest).subscribe(response => {
      if (response.id) {
        this.notifierService.showNotification('Parametrização realizada.', null, 'success');
        this.store.dispatch(closePreloader())
        this.cancel();
        return;
      }

      this.notifierService.showNotification(response.errors[0].message, null, 'error');
      this.store.dispatch(closePreloader())
    })

  }

  getDudaPorId(parametrizaDudaId) {
    this.store.dispatch(showPreloader({ payload: '' }))
    this.taxaService.obterDudaPorId(parametrizaDudaId).subscribe(
      result => {
        this.parametrizarDudaForm.patchValue({
          cnpj: this.cnpjEmpresa,
          estoque: result.estoque
        });

        this.store.dispatch(closePreloader())
      },
      error => this.store.dispatch(closePreloader())
    )
  }

  formatDate(date: string) {
    return Utility.formatGridDate(date);
  }

  cancel() {
    this.route.navigate(['../../'], { relativeTo: this.activatedRoute })
  }
}
