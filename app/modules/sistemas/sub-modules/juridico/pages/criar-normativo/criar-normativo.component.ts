import { Component, OnInit } from '@angular/core';
import { Validators, UntypedFormBuilder } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { UploadImagem } from 'src/app/shared/core/models/upload-imagem.model';
import { TipoStatusImagem } from '../../../faturamento/core/enums/tipo-status-imagem.enum';
import { DatePipe } from '@angular/common';
import { ObterListaTipoNormativoResponse } from '../../core/responses/obter-tipo-normativo.response';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { Store } from '@ngrx/store';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { ActivatedRoute, Router } from '@angular/router';
import { FiltroNormativos, Normativo } from '../../core/model/normativos.model';
import { NormativosService } from '../../services/normativos.service';

@Component({
  selector: 'app-criar-normativo',
  templateUrl: './criar-normativo.component.html',
  styleUrls: ['./criar-normativo.component.scss']
})
export class CriarNormativoComponent implements OnInit {
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

  normativoId: number = null;
  normativo: Normativo;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private normativosService: NormativosService,
    private notifierService: NotifierService,
    private store: Store<{ preloader: IPreloaderState }>) {
    this.normativoId = this.activatedRoute.snapshot.params['idNormativo'];
  }

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

    if (this.normativoId != null) {
      const filtros = new FiltroNormativos();

      filtros.id = this.normativoId;

      this.store.dispatch(showPreloader({ payload: 'Carregando normativo...' }));

      this.normativosService.consultarNormativoPorId(this.normativoId).subscribe({
        next: (value: any) => {
          this.normativo = value.result;
          
          this.criarNormativoForm.setValue({
            id: this.normativo.id,
            nomePortaria: this.normativo.nomePortaria,
            visao: this.normativo.ehVisaoNacional,
            tipoNormativo: Number(this.normativo.tipoNormativo),
            tipoRegistro: Number(this.normativo.tipoRegistro),
            uf: this.normativo.uf,
            arquivo: '',
            dataVigencia: this.normativo.dataVigencia ? new Date(this.normativo.dataVigencia) : null,
          });

          this.criarNormativoForm.get('arquivo').clearValidators();
          this.criarNormativoForm.get('arquivo').updateValueAndValidity();

          this.arquivo = new UploadImagem();

          this.arquivo.nome = this.normativo.nomeArquivo;
          this.arquivo.statusArquivo = TipoStatusImagem.Sucesso;
        },
        error: (err) => {
          this.notifierService.showNotification(JSON.stringify(err), "Erro ao carregar normativo", "error");
        },
        complete: () => {
          this.store.dispatch(closePreloader());
        },
      });
    }
  }

  ngAfterViewInit(){
    
  }

  carregarOpcoesTipoNormativo() {
    this.normativosService.obterListaTipoNormativo().subscribe((result) => {
      this.opcoesTipoNormativo = result;
    });
  }

  onClickFile(fileDropRef: any) {
    fileDropRef.click();
  }

  onFileDropped(event) {
    this.prepareFilesList(event);
  }

  fileBrowseHandler(event) {
    this.prepareFilesList(event);
  }

  prepareFilesList(files: Array<any>) {
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.readAsDataURL(files[i]);
      reader.onload = () => {
        let base64 = reader.result.toString();
        let file: UploadImagem = {
          nome: files[i].name,
          type: files[i].type,
          tamanho: files[i].size,
          dataEnvio: this.pipe.transform(new Date(), 'dd/MM/yyyy - HH:mm'),
          base64: base64.split('base64,')[1],
          statusArquivo: TipoStatusImagem.Processando
        };

        this.arquivo = file;
        this.validarArquivo();
      };
    }
  }

  getExtension(file) {
    return file.nome.split('.').pop().toUpperCase();
  }

  validarArquivo() {
    if (!this.isFileTypeAllowed(this.arquivo.type, this.acceptedTypes)) {
      this.arquivo.statusArquivo = TipoStatusImagem.FormatoInvalido;
      return;
    }

    if (this.arquivo.tamanho > 10000000) {
      this.arquivo.statusArquivo = TipoStatusImagem.TamanhoInvalido;
      return;
    }

    this.arquivo.statusArquivo = TipoStatusImagem.Sucesso;
  }

  private isFileTypeAllowed(extension: string, allowedExtensions: string[]): boolean {
    return allowedExtensions.includes(extension);
  }

  onClickDelete() {
    this.arquivo = null
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
  }

  submitFormulario() {
    if (this.normativoId == null) {
      this.submitCriarNormativo();
    } else {
      this.submitEditarNormativo();
    }
  }

  submitCriarNormativo() {
    this.store.dispatch(showPreloader({ payload: 'Incluindo normativo...' }));

    var request = {
      NomePortaria: this.criarNormativoForm.get('nomePortaria').value,
      Uf: this.criarNormativoForm.get('uf').value,
      DataVigencia: this.pipe.transform(this.criarNormativoForm.get('dataVigencia').value, 'MM/dd/YYYY'),
      TipoRegistro: this.criarNormativoForm.get('tipoRegistro').value,
      TipoNormativo: this.criarNormativoForm.get('tipoNormativo').value,
      VisaoNacional: this.criarNormativoForm.get('visao').value,
    };

    var arquivo = new Blob([this.base64ToArrayBuffer(this.arquivo.base64)], { type: this.arquivo.type });

    this.normativosService.cadastrarNormativo(request, arquivo, this.arquivo.nome).subscribe({
      next: (resp) => {
        this.notifierService.showNotification("O normativo foi incluido com sucesso.", "Normativo incluido com sucesso", "success");
        this.router.navigate(['/normativos']);
      },
      error: (err) => {
        this.notifierService.showNotification(err.error, "Erro ao incluir normativo", "error");
        this.store.dispatch(closePreloader());
      },
      complete: () => {
        this.store.dispatch(closePreloader());
      },
    });
  }

  submitEditarNormativo() {
    this.store.dispatch(showPreloader({ payload: 'Editando normativo...' }));

    var request = {
      Id: this.criarNormativoForm.get('id').value,
      NomePortaria: this.criarNormativoForm.get('nomePortaria').value,
      TipoNormativo: this.criarNormativoForm.get('tipoNormativo').value,
      TipoRegistro: this.criarNormativoForm.get('tipoRegistro').value,
      DataVigencia: this.pipe.transform(this.criarNormativoForm.get('dataVigencia').value, 'MM/dd/YYYY'),
      Uf: this.criarNormativoForm.get('uf').value,
      VisaoNacional: this.criarNormativoForm.get('visao').value,
    };

    var arquivo = null;

    if(this.arquivo.base64 != null && this.arquivo.type != null){
      arquivo = new Blob([this.base64ToArrayBuffer(this.arquivo.base64)], { type: this.arquivo.type });
    }

    this.normativosService.editarNormativo(request, arquivo, this.arquivo.nome, this.normativoId).subscribe({
      next: (resp) => {
        this.notifierService.showNotification("O normativo foi editado com sucesso.", "Normativo editado com sucesso", "success");
        this.router.navigate(['/normativos']);
      },
      error: (err) => {
        this.notifierService.showNotification(JSON.stringify(err), "Erro ao editar normativo", "error");
        this.store.dispatch(closePreloader());
      },
      complete: () => {
        this.store.dispatch(closePreloader());
      },
    });
  }
}
