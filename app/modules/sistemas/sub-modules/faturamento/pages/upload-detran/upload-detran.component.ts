import { Component, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Store } from '@ngrx/store';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { SortByPipe } from 'src/app/shared/pipes/sort-by.pipe';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { ValorDominio } from '../../../admin/core/models/_portal/dominios/valor-dominio.model';
import { ConciliacaoDetranMG } from '../../core/models/upload-detran/conciliacao-detran-mg.model';
import { ConciliacaoDetran } from '../../core/models/upload-detran/conciliacao-detran.model';
import { DetranService } from '../../services/detran.service';
import { DialogEnviarArquivosDetranComponent } from './components/dialog-enviar-arquivos-detran/dialog-enviar-arquivos-detran.component';


@Component({
  selector: 'app-upload-detran',
  templateUrl: './upload-detran.component.html',
  styleUrls: ['./upload-detran.component.scss']
})
export class UploadDetranComponent implements OnInit {

  utility = Utility
  ufs: ValorDominio[] = [
    {
      "id": 23,
      "palavraChave": "UFD_AC",
      "valor": "AC"
    },
    {
      "id": 25,
      "palavraChave": "UFD_AP",
      "valor": "AP"
    },
    {
      "id": 26,
      "palavraChave": "UFD_MG",
      "valor": "MG"
    },
    {
      "id": 36,
      "palavraChave": "UFD_PB",
      "valor": "PB"
    },
    {
      "id": 44,
      "palavraChave": "UFD_RR",
      "valor": "RR"
    },
    {
      "id": 46,
      "palavraChave": "UFD_SP",
      "valor": "SP"
    }
  ];
  formulario: FormGroup;
  sortPipe = new SortByPipe();

  constructor(private dialog: MatDialog, private fb: UntypedFormBuilder, private dialogService: DialogCustomService, private detranService: DetranService,
    private store: Store<{ preloader: IPreloaderState }>, private notifierService: NotifierService) {

  }

  ngOnInit(): void {
    this.initializeForm();
  }

  abrirDialogEnviarArquivos() {
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'enviar-arquivos-detran'),
      width: '600px',
      data: {
        component: DialogEnviarArquivosDetranComponent,
        titleClass: 'd-none',
        buttonCancel: {
          value: false,
          text: 'Fechar',
        },
        buttonConfirm: {
          value: true,
          text: 'Adicionar',
        },
        disableSaveWithoutData: true,
        uf: this.formulario.get('uf').value
      }
    });

    dialogRef.afterClosed().subscribe((confirmacao) => {
      if (confirmacao) {
        this.store.dispatch(showPreloader({ payload: '' }));
        this.dialogService.dialogData$.subscribe((listaImagens) => {
          if (listaImagens.files) {
            listaImagens.files = listaImagens.files.filter(
              (imagem) => imagem.statusArquivo === 5
            );
            this.criarForm(listaImagens);
          }
        }).unsubscribe();
      }
    });
  }

  private async criarForm(listaImagens: any) {
    const hasPdf = listaImagens.filesPdf.length > 0; // Simplified condition check

    if (this.formulario.get('uf').value === 'MG') {
      const requestMG = {
        uf: this.formulario.get('uf').value,
        mesCompetencia: this.formulario.get('mes').value,
        anoCompetencia: this.formulario.get('ano').value,
        base64ArquivosDetran: listaImagens.files?.map(file => file.base64),
        base64Boletos: listaImagens.filesPdf?.map(file => file.base64)
      };

      this.uploadArquivosMG(requestMG);
      return;
    }

    if (!hasPdf) {
      const requestsArquivoDetran = listaImagens.files.map(file => ({
        uf: this.formulario.get('uf').value,
        mesCompetencia: this.formulario.get('mes').value,
        anoCompetencia: this.formulario.get('ano').value,
        base64ArquivoDetran: file.base64,
        base64Boleto: '',
        base64Oficio: '',
      }));

      let retorno = await Promise.all(requestsArquivoDetran.map(request => this.uploadArquivos(request)));
      if (retorno) { this.store.dispatch(closePreloader()); }
      return;
    }

    const requestsBoletoDetran = listaImagens.filesPdf.map(file => ({
      uf: this.formulario.get('uf').value,
      mesCompetencia: this.formulario.get('mes').value,
      anoCompetencia: this.formulario.get('ano').value,
      base64ArquivoDetran: listaImagens.files[0]?.base64 || '',
      base64Boleto: this.formulario.get('uf').value === 'PB' ? file.base64 : '',
      base64Oficio: this.formulario.get('uf').value === 'SP' ? file.base64 : '',
    }));

    let retorno = await Promise.all(requestsBoletoDetran.map(request => this.uploadArquivos(request)));
    if (retorno) { this.store.dispatch(closePreloader()); }
  }

  uploadArquivos(form: ConciliacaoDetran) {
    return new Promise((resolve, reject) => {
      this.detranService.uploadArquivoDetranConciliado(form).subscribe({
        next: (response) => {
          if (response.isSuccessful) {
            this.notifierService.showNotification('Arquivo enviado com sucesso!', 'Sucesso', 'success');
          } else {
            this.notifierService.showNotification(response.errors[0].message, null, 'error');
          }
          resolve(response);
        },
        error(err) {
          reject(err);
        }
      });
    });
  }

  uploadArquivosMG(request: ConciliacaoDetranMG) {
    this.detranService.uploadArquivoDetranConciliadoMG(request).subscribe(response => {
      this.store.dispatch(closePreloader());
      if (response.errors?.length > 0) {
        this.notifierService.showNotification(response.errors[0].message, null, 'error');
        return;
      }

      this.notifierService.showNotification('Arquivo enviado com sucesso!', 'Sucesso', 'success');
    })
  }

  private initializeForm() {
    this.formulario = this.fb.group({
      uf: [null, Validators.required],
      mes: [null, Validators.required],
      ano: [new Date().getFullYear(), Validators.required]
    });
  }
}
