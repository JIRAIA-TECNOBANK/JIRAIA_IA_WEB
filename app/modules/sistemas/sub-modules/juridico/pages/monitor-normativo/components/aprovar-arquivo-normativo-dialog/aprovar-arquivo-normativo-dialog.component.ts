import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { Validators, UntypedFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { TipoStatusImagem } from 'src/app/shared/core/enums/tipo-status-imagem.enum';
import { UploadImagem } from 'src/app/shared/core/models/upload-imagem.model';
import { showPreloader, closePreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { Normativo, FiltroNormativos } from '../../../../core/model/normativos.model';
import { ObterListaTipoNormativoResponse } from '../../../../core/responses/obter-tipo-normativo.response';
import { NormativosService } from '../../../../services/normativos.service';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';

@Component({
  selector: 'app-aprovar-arquivo-normativo-dialog',
  templateUrl: './aprovar-arquivo-normativo-dialog.component.html',
  styleUrls: ['./aprovar-arquivo-normativo-dialog.component.scss']
})
export class AprovarArquivoNormativoDialogComponent {
  utility = Utility;
  acceptedTypes: string[] = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  fileError: string = null;
  arquivo: UploadImagem = null;
  pipe = new DatePipe('en-US');

  criarNormativoForm = this.formBuilder.group({
    id: [null],
    nomePortaria: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
    visao: [null, Validators.required],
    tipoNormativo: [null, Validators.required],
    tipoRegistro: [null, Validators.required],
    uf: [null, Validators.required],
    arquivo: [''],
    dataVigencia: [''],
  });

  opcoesTipoNormativo: ObterListaTipoNormativoResponse = new ObterListaTipoNormativoResponse();

  constructor(
    private router: Router,
    private formBuilder: UntypedFormBuilder,
    private normativosService: NormativosService,
    private dialogRef: MatDialogRef<AprovarArquivoNormativoDialogComponent>,
    private dialogService: DialogCustomService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.carregarOpcoesTipoNormativo();

    this.criarNormativoForm.get('visao').valueChanges.subscribe((visaoValue) => {
      const ufControl = this.criarNormativoForm.get('uf');

      if (visaoValue) {
        ufControl.clearValidators();
      } else {
        ufControl.setValidators([Validators.required]);
      }

      ufControl.updateValueAndValidity();
    });

    if (this.data) {
      this.criarNormativoForm.patchValue({
        id: null,
        nomePortaria: this.data.normativo.nomePortaria || '',
        visao: this.data.normativo.visao || null,
        tipoNormativo: this.data.normativo.tipoNormativo || null,
        tipoRegistro: this.data.normativo.tipoRegistro || null,
        uf: this.data.normativo.uf || null,
        arquivo: '',
        dataVigencia: this.data.normativo.dataVigencia ? new Date(this.data.normativo.dataVigencia) : null,
      });

      this.criarNormativoForm.get('arquivo').clearValidators();
      this.criarNormativoForm.get('arquivo').updateValueAndValidity();

      this.arquivo = new UploadImagem();

      this.arquivo.nome = this.data.normativo.nomePortaria;
      this.arquivo.statusArquivo = TipoStatusImagem.Sucesso;
    }
  }

  carregarOpcoesTipoNormativo() {
    this.normativosService.obterListaTipoNormativo().subscribe((result) => {
      this.opcoesTipoNormativo = result;
    });
  }

  cancelar() {
    this.dialogRef.close();
  }

  salvar() {
    if (this.criarNormativoForm.valid) {
      var request = {
        NomePortaria: this.criarNormativoForm.get('nomePortaria').value,
        Uf: this.criarNormativoForm.get('uf').value,
        DataVigencia: this.pipe.transform(this.criarNormativoForm.get('dataVigencia').value, 'MM/dd/YYYY'),
        TipoRegistro: this.criarNormativoForm.get('tipoRegistro').value,
        TipoNormativo: this.criarNormativoForm.get('tipoNormativo').value,
        VisaoNacional: this.criarNormativoForm.get('visao').value,
      };

      this.dialogRef.close(request);
    }
  }
}
