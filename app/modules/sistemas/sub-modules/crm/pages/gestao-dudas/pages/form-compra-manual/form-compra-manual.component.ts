import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Permissao } from 'src/app/modules/sistemas/sub-modules/admin/core/models/perfis/permissao.model';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { CompraManualRequest } from '../../../../core/requests/taxas/compra-manual.request';
import { TaxasService } from '../../../../services/taxas.service';
import { Utility } from 'src/app/core/common/utility';

@Component({
  selector: 'app-form-compra-manual',
  templateUrl: './form-compra-manual.component.html',
  styleUrls: ['./form-compra-manual.component.scss']
})
export class FormCompraManualComponent implements OnInit {

  utility = Utility;
  
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private notifierService: NotifierService,
    private taxaService: TaxasService,
    private store: Store<{ preloader: IPreloaderState }>,
  ) {
    this.cnpj = this.activatedRoute.snapshot.params['cnpj'];
    this.detranId = this.activatedRoute.snapshot.params['detranId'];
  }

  cnpj: number = null;
  detranId: number = null;

  compraManualForm = this.formBuilder.group({
    cnpj: [{ value: '', disabled: true }],
    quantidade: [null, Validators.compose([Validators.required])],
    justificativa: [null, Validators.required],
  });

  ngOnInit(): void {
    this.compraManualForm.get('cnpj').setValue(this.cnpj);
  }

  submitCompraManual() {
    let compraManualRequest = <CompraManualRequest>{
      detranId: this.detranId,
      quantidade: this.compraManualForm.get('quantidade').value,
      justificativa: this.compraManualForm.get('justificativa').value
    };

    this.store.dispatch(showPreloader({ payload: '' }))

    this.taxaService.compraManual(compraManualRequest).subscribe(response => {
      if (response.compraManualId) {
        this.notifierService.showNotification('Compra manual realizada.', null, 'success');
        this.cancel();
        this.store.dispatch(closePreloader())
        return;
      }

      this.notifierService.showNotification(response.errors[0].message, null, 'error');
      this.store.dispatch(closePreloader())
    })
  }

  cancel() {
    this.route.navigate(['../../../'], { relativeTo: this.activatedRoute })
  }
}
