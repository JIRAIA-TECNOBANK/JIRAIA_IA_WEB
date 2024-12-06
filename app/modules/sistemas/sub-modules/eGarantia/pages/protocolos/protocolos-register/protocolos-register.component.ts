import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ProtocolosService } from '../../../services/protocolos.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';

@Component({
  selector: 'app-protocolos-register',
  templateUrl: './protocolos-register.component.html',
  styleUrls: ['./protocolos-register.component.scss']
})
export class ProtocolosRegisterComponent implements OnInit {
  
  createProtocoloForm = this.formBuilder.group({
    nome: ['', [Validators.required]],
    callbackUrl: ['', [Validators.required]],
    ativo: [true]
  });
  protocoloId: any = null;
  protocolo: any = null;
  transacoes: any[] = [];

  constructor(
    private formBuilder: UntypedFormBuilder,
    private produtoProtocolosService: ProtocolosService,
    private router: Router,
    private route: ActivatedRoute,
    private notifierService: NotifierService,
    private store: Store
  ) { }

  ngOnInit(): void {
    const protocoloId = this.route.snapshot.paramMap.get('eGarantiaNumeroProtocolo');
    if (protocoloId) {
      this.carregarProtocolo(protocoloId);
      this.protocoloId = protocoloId;
    }
  }

  carregarProtocolo(id: string) {
    this.store.dispatch(showPreloader({ payload: '' }));
    this.produtoProtocolosService.obterProtocoloPorId(id).subscribe(
      response => {
        this.protocolo = response;
        this.transacoes = response.transacoes || [];
        this.createProtocoloForm.patchValue(response);
        this.store.dispatch(closePreloader());
      },
      () => {
        this.store.dispatch(closePreloader());
      }
    );
  }

  submitProtocolo() {
    if (this.createProtocoloForm.invalid) {
      return;
    }

    const protocolo = this.createProtocoloForm.value;

    this.store.dispatch(showPreloader({ payload: '' }));

    if (this.protocolo?.nsu) {
      this.produtoProtocolosService.atualizarProtocolo(this.protocolo.nsu, protocolo).subscribe(
        () => {
          this.notifierService.showNotification('Protocolo atualizado com sucesso.', 'Sucesso', 'success');
          this.store.dispatch(closePreloader());
          this.router.navigate(['/e-garantia/protocolos']);
        },
        (error) => {
          this.store.dispatch(closePreloader());
          this.notifierService.showNotification(`${error.error[0].message}`, 'Erro', 'error');
        }
      );
    } else {
      this.produtoProtocolosService.criarProtocolo(protocolo).subscribe(
        () => {
          this.notifierService.showNotification('Protocolo criado com sucesso.', 'Sucesso', 'success');
          this.store.dispatch(closePreloader());
          this.router.navigate(['/e-garantia/protocolos']);
        },
        (error) => {
          this.store.dispatch(closePreloader());
          this.notifierService.showNotification(`${error.error[0].message}`, 'Erro', 'error');
        }
      );
    }
  }

  voltar() {
    this.router.navigate(['/protocolos']);
  }

  formatarData(data: string): string {
    const dataObj = new Date(data);
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();
    const hora = String(dataObj.getHours()).padStart(2, '0');
    const minuto = String(dataObj.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
  }
}
