import { Component, Input, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { EnderecosResponse } from '../../../../core/responses/empresas/obter-enderecos.response';
import { EmpresasService } from '../../../../services/empresas.service';
import { DialogConfirmComponent } from '../dialog-confirm/dialog-confirm.component';
import { Permissoes } from 'src/app/core/common/permissoes';

@Component({
  selector: 'app-listar-enderecos',
  templateUrl: './listar-enderecos.component.html',
  styleUrls: ['./listar-enderecos.component.scss'],
})
export class ListarEnderecosComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  @Input() listaEnderecos: EnderecosResponse[] = [];
  @Input() selecaoEnderecos: boolean = false;
  @Input() isCreate: boolean;
  @Input() empresaId: number = null;

  @Output() add: EventEmitter<any> = new EventEmitter();
  @Output() concluir: EventEmitter<any> = new EventEmitter();
  @Output() edit: EventEmitter<any> = new EventEmitter();
  @Output() delete: EventEmitter<any> = new EventEmitter();

  enderecosForm = this.formBuilder.group({ endereco: [null] });

  constructor(private formBuilder: UntypedFormBuilder,
    private empresasService: EmpresasService,
    private notifierService: NotifierService,
    private store: Store<{ preloader: IPreloaderState }>,
    public dialog: MatDialog
  ) {
  }

  openDialog(empresaId: number, enderecoId: number): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: { descricao: "Deseja excluir este endereço? " },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'delete') {
        this.deleteEndereco(enderecoId);
      }
    });
  }

  ngOnInit(): void {
    this.enderecosForm.valueChanges.subscribe(value => {
      if (this.selecaoEnderecos && value != null) {
        this.concluir.emit(this.listaEnderecos.filter(endereco => endereco.id == this.enderecosForm.get('endereco').value)[0]);
      }
    })
  }

  addEndereco() {
    this.add.emit(null);
  }

  concluirEvent() {
    if (this.selecaoEnderecos && this.enderecosForm.get('endereco').value !== null) {
      this.concluir.emit(this.listaEnderecos.filter(endereco => endereco.id == this.enderecosForm.get('endereco').value)[0]);
      return;
    }

    this.concluir.emit(null);
  }

  editEndereco(enderecoId) {
    this.edit.emit(enderecoId);

  }

  deleteEndereco(enderecoId) {
    this.store.dispatch(showPreloader({ payload: '' }))

    this.empresasService.deleteEndereco(this.empresaId, enderecoId).toPromise()
      .then(result => {
        this.notifierService.showNotification(
          'Endereço excluído.',
          'Sucesso',
          'success'
        );
        this.delete.emit(null);
        this.store.dispatch(closePreloader());
      })
      .catch((e) => {
        console.info(e);
      });

  }

  separaDetrans(detrans: string) {
    if (Utility.isNullOrEmpty(detrans)) return "";

    let listaDetrans = detrans.split(',');
    let retorno = "";

    listaDetrans.forEach(detran => {
      if (retorno == "") { retorno = detran; }
      else {
        retorno += ", " + detran;
      }
    });

    return retorno + ".";
  }
}
function openDialog() {
  throw new Error('Function not implemented.');
}

