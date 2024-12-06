import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { DetransService } from '../../../services/detrans.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';

@Component({
  selector: 'app-detrans-register',
  templateUrl: './detrans-register.component.html',
  styleUrls: ['./detrans-register.component.scss']
})
export class DetransRegisterComponent implements OnInit {

  createDetranForm = this.formBuilder.group({
    uf: ['', [Validators.required, Validators.maxLength(2), Validators.pattern('[A-Za-z]*')]],
    ativo: [true],
    transacaoSimulada: [true]
  });

  estados: string[] = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  detranId: string = null;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private produtoDetransService: DetransService,
    private router: Router,
    private route: ActivatedRoute,
    private notifierService: NotifierService,
    private store: Store
  ) { }

  ngOnInit(): void {
    this.detranId = this.route.snapshot.paramMap.get('id');
    if (this.detranId) {
      this.carregarDetran(this.detranId);
    }
  }

  carregarDetran(id: string) {
    this.store.dispatch(showPreloader({ payload: '' }));
    this.produtoDetransService.obterDetranPorId(id).subscribe(detran => {
      this.createDetranForm.patchValue(detran);
      this.store.dispatch(closePreloader());
    });
  }

  submitDetran() {
    if (this.createDetranForm.invalid) {
      return;
    }

    const detran = this.createDetranForm.value;

    this.store.dispatch(showPreloader({ payload: '' }));

    if (this.detranId) {
      this.produtoDetransService.atualizarDetran(this.detranId, detran).subscribe(
        () => {
          this.notifierService.showNotification('Detran atualizado com sucesso.', 'Sucesso', 'success');
          this.store.dispatch(closePreloader());
          this.router.navigate(['/e-garantia/detrans']);
        },
        (error) => {
          this.store.dispatch(closePreloader());
          this.notifierService.showNotification(`${error.error[0].message}`, 'Erro', 'error');
        }
      );
    } else {
      this.produtoDetransService.criarDetran(detran).subscribe(
        () => {
          this.notifierService.showNotification('Detran criado com sucesso.', 'Sucesso', 'success');
          this.store.dispatch(closePreloader());
          this.router.navigate(['/e-garantia/detrans']);
        },
        (error) => {
          this.store.dispatch(closePreloader());
          this.notifierService.showNotification(`${error.error[0].message}`, 'Erro', 'error');
        }
      );
    }
  }

}
