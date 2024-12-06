import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroupDirective, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import {
  closePreloader,
  showPreloader,
} from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { CadastrarDocumentoRequest } from '../../../../core/requests/documentos/cadastrar-documento.request';
import { DocumentosService } from '../../../../services/documentos.service';
import { DialogConfirmComponent } from '../dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-documentos',
  templateUrl: './documentos.component.html',
  styleUrls: ['./documentos.component.scss'],
})
export class DocumentosComponent implements OnInit {
  @ViewChild('fileDropRef', { static: false }) fileDropEl: ElementRef;
  @ViewChild(FormGroupDirective) formDirective: FormGroupDirective;
  @Output() nextTab: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() nextStep: EventEmitter<number> = new EventEmitter<number>();
  @Input('companyId') companyId: any;

  filesForm = this.formBuilder.group({
    nome: [
      '',
      Validators.compose([Validators.required, Validators.maxLength(20)]),
    ],
    descricao: ['', Validators.maxLength(50)],
    arquivo: ['', Validators.required],
  });

  files = [];
  fileId: number;
  addedFile: any = null;
  addFileExtension: string[] = [];
  messagePreloader: string = '';

  acceptedTypes: string[] = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  downloadingItem: number = null;

  utility = Utility;
  Permissoes = Permissoes;

  // boolean
  isEdition: boolean = false;
  loading: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private notifierService: NotifierService,
    private store: Store<{ preloader: IPreloaderState }>,
    private documentosService: DocumentosService,
    public dialog: MatDialog
  ) {
    if (this.activatedRoute.snapshot.params['empresaId'] != undefined) {
      this.companyId = this.activatedRoute.snapshot.params['empresaId'];
    }
  }

  hasFiles() {
    return this.files.length ? true : false;
  }

  hasFileId() {
    return this.fileId ? 'Salvar' : 'Adicionar';
  }

  isFileFormValid() {
    return this.filesForm.valid && this.companyId;
  }

  getExtension(file) {
    return file.nome.split('.').pop().toUpperCase();
  }

  formatDate(date: string) {
    return Utility.formatGridDate(date);
  }

  ngOnInit(): void {
    this.companyId && this.getCompanyFiles();
  }

  getCompanyFiles() {
    this.store.dispatch(showPreloader({ payload: this.messagePreloader }));
    this.documentosService
      .obterDocumentos(this.companyId, true, 50)
      .subscribe((result) => {
        this.files = result.documentos;
        this.store.dispatch(closePreloader());
      });
  }

  onSubmit() {}

  onSaveFile() {
    this.nextTab.emit();
    this.nextStep.emit(0);
  }

  addFile() {
    this.toggleEdition();
  }

  cancelFile() {
    this.filesForm.reset();
    this.toggleEdition();
  }

  toggleEdition() {
    this.isEdition = !this.isEdition;
  }

  onClickDownload(documentoGuid, nomeArquivo, index) {
    this.downloadingItem = index;
    this.loading = true;
    let fileBase64: string;
    this.documentosService
      .obterDocumentoPorGuid(this.companyId, documentoGuid)
      .subscribe((result) => {
        fileBase64 = result.documentoBase64;
        this.downloadPdf(fileBase64, nomeArquivo);
      });
  }

  downloadPdf(base64String, fileName) {
    let fileNameExtension = fileName.split('.');
    let source = '';
    switch (fileNameExtension[1]) {
      case 'pdf':
        source = `data:application/pdf;base64,${base64String}`;
        break;
      case 'doc':
        source = `data:application/msword;base64,${base64String}`;
        break;
      case 'docx':
        source = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64String}`;
        break;
    }

    const link = document.createElement('a');
    link.href = source;
    link.download = `${fileNameExtension[0]}.${fileNameExtension[1]}`;
    link.click();

    this.loading = false;
  }

  onClickDelete(documentoGuid: string) {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: { descricao: 'Deseja excluir este arquivo? ' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'delete') {
        this.documentosService
          .deletarDocumento(this.companyId, documentoGuid)
          .subscribe(
            (response) => {
              if (response.isSuccessful) {
                this.notifierService.showNotification(
                  'Arquivo excluído.',
                  'Sucesso',
                  'success'
                );
                this.getCompanyFiles();
                return;
              }
              this.notifierService.showNotification(
                response.errors[0].message,
                'Erro',
                'error'
              );
            },
            (error) =>
              this.notifierService.showNotification(
                error.error.errors[0].message,
                'Erro',
                'error'
              )
          );
      }
    });
  }

  /**
   * Trigger para o click do input file
   * @param fileDropRef (Input file)
   */
  onClickFile(fileDropRef: any) {
    fileDropRef.click();
  }

  onFileDropped($event) {
    this.addedFile = $event;
    this.addFileExtension = this.addedFile[0].name.split('.');
    this.filesForm.controls['nome'].setValue(
      this.addFileExtension[0].substring(0, 20)
    );
  }

  fileBrowseHandler($event) {
    this.addedFile = $event;
    this.addFileExtension = this.addedFile[0].name.split('.');
    this.filesForm.controls['nome'].setValue(
      this.addFileExtension[0].substring(0, 20)
    );
  }

  /**
   * Converte a lista de arquivos para uma lista normal
   * @param files (Files List)
   * @param addFile (Files list)
   */
  prepareFilesList(files: Array<any>) {
    this.files = [];

    if (
      this.acceptedTypes.find((type) => type === files[0].type) === undefined ||
      this.addedFile[0].name.split('.').pop().toUpperCase() === 'DOT'
    ) {
      this.notifierService.showNotification(
        'Arquivo com formato inválido.',
        'Atenção',
        'error'
      );

      return false;
    }

    if (!this.formatBytes(files[0].size)) {
      this.notifierService.showNotification(
        'Falha no upload, tamanho superior ao permitido.',
        'Atenção',
        'error'
      );
      return false;
    }

    let fileBase64: string;
    this.getBase64(this.addedFile[0]).then((data) => {
      fileBase64 = data.toString().split('base64,').pop();
      this.submitFile(fileBase64);
    });
  }

  submitFile(fileBase64) {
    let file = <CadastrarDocumentoRequest>{
      nomeArquivo:
        this.filesForm.controls['nome'].value + '.' + this.addFileExtension[1],
      descricao: this.filesForm.controls['descricao'].value,
      documentoBase64: fileBase64,
    };

    this.store.dispatch(showPreloader({ payload: 'Incluindo arquivo' }));
    this.documentosService
      .cadastrarDocumento(this.companyId, file)
      .subscribe((result) => {
        if (result.documentoGuid) {
          this.filesForm.reset();
          this.notifierService.showNotification(
            'Arquivo enviado.',
            'Sucesso',
            'success'
          );
          this.store.dispatch(closePreloader());
          this.fileDropEl.nativeElement.value = '';
          this.filesForm.reset();
          this.getCompanyFiles();
          this.toggleEdition();
        } else {
          this.store.dispatch(closePreloader());
          this.notifierService.showNotification(
            result.errors[0].message,
            'Erro ' + result.errors[0].code,
            'error'
          );
        }
        this.formDirective.resetForm();
      });
  }

  /**
   * Formata os bytes
   * @param bytes (Tamanho do arquivo em bytes)
   * @param decimals (Pontos decimais)
   */
  formatBytes(bytes, decimals = 2) {
    let megabytes = Utility.formatMegabytes(bytes);
    if (megabytes > 10) {
      this.files = null;
      return false;
    }

    let size = megabytes.toFixed(decimals);
    return size + 'MB';
  }

  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
}
