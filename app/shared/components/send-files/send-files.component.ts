import { DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

import { Utility } from 'src/app/core/common/utility';
import { CadastrarDocumentoRequest } from 'src/app/modules/sistemas/sub-modules/crm/core/requests/documentos/cadastrar-documento.request';
import { DialogConfirmComponent } from 'src/app/modules/sistemas/sub-modules/crm/pages/empresas/components/dialog-confirm/dialog-confirm.component';
import { DocumentosService } from 'src/app/modules/sistemas/sub-modules/crm/services/documentos.service';
import {
  closePreloader,
  showPreloader,
} from '../../store/preloader/actions/preloader.actions';
import { IPreloaderState } from '../../store/preloader/preloader.reducer';
import { NotifierService } from '../notifier/notifier.service';

import { Store } from '@ngrx/store';

@Component({
  selector: 'app-send-files',
  templateUrl: './send-files.component.html',
  styleUrls: ['./send-files.component.scss'],
})
export class SendFilesComponent implements OnInit {
  @ViewChild('fileDropRef', { static: false }) fileDropEl: ElementRef;

  @Input() empresaId: number = null;
  @Input() grupoEconomicoId: number = null;
  @Input() disableCadastro: boolean = false;

  @Output() fileListLength = new EventEmitter<number>();

  files: any = [];
  filesList: any = [];
  acceptedTypes: string[] = [ 
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  pipe = new DatePipe('en-US');
  loading: boolean = false;

  addFile: any = null;
  addFileExtension: string[] = [];
  downloadingItem: number = null;

  retornoUpload: boolean = false;

  sendFileForm = this.formBuilder.group({
    nome: [
      '',
      Validators.compose([Validators.required, Validators.maxLength(20)]),
    ],
    descricao: ['', Validators.maxLength(50)],
    arquivo: '',
  });

  constructor(
    private notifierService: NotifierService,
    private formBuilder: UntypedFormBuilder,
    private documentosService: DocumentosService,
    private store: Store<{ preloader: IPreloaderState }>,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (this.empresaId) { this.carregaListaDocumentos(this.empresaId); }
    if (this.disableCadastro) { Utility.modoConsulta(this.sendFileForm); }
  }

  ngOnDestroy(): void {
    this.files = null;
  }

  carregaListaDocumentos(empresaId) {
    this.documentosService
      .obterDocumentos(empresaId, true, 50)
      .subscribe((result) => {
        this.filesList = result.documentos;
        this.fileListLength.emit(this.filesList.length);
      });
  }

  onFileDropped($event) {
    if (this.disableCadastro) return;

    this.addFile = $event
    this.addFileExtension = this.addFile[0].name.split('.')
    this.sendFileForm.controls['nome'].setValue(this.addFileExtension[0].substring(0, 20))
  }

  fileBrowseHandler($event) {
    this.addFile = $event;
    this.addFileExtension = this.addFile[0].name.split('.');
    this.sendFileForm.controls['nome'].setValue(
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
      this.addFile[0].name.split('.').pop().toUpperCase() === 'DOT'
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
    this.getBase64(this.addFile[0]).then((data) => {
      fileBase64 = data.toString().split('base64,').pop();
      this.submitFile(fileBase64);
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

  submitFile(fileBase64) {
    let file = <CadastrarDocumentoRequest>{
      nomeArquivo:
        this.sendFileForm.controls['nome'].value +
        '.' +
        this.addFileExtension[1],
      descricao: this.sendFileForm.controls['descricao'].value,
      documentoBase64: fileBase64,
    };

    this.store.dispatch(showPreloader({ payload: 'Incluindo arquivo' }));
    this.documentosService
      .cadastrarDocumento(this.empresaId, file)
      .subscribe((result) => {
        if (result.documentoGuid) {
          this.sendFileForm.reset();
          this.notifierService.showNotification(
            'Arquivo enviado.',
            'Sucesso',
            'success'
          );
          this.store.dispatch(closePreloader());
          this.fileDropEl.nativeElement.value = '';
          this.sendFileForm.reset();
          this.carregaListaDocumentos(this.empresaId);
        } else {
          this.store.dispatch(closePreloader());
          this.notifierService.showNotification(
            result.errors[0].message,
            'Erro ' + result.errors[0].code,
            'error'
          );
        }
      });
  }

  /**
   * Trigger para o click do input file
   * @param fileDropRef (Input file)
   */
  onClickFile(fileDropRef: any) {
    if (this.disableCadastro) return;
    fileDropRef.click();
  }

  getExtension(file) {
    return file.nome.split('.').pop().toUpperCase();
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

  onClickDownload(documentoGuid, nomeArquivo, index) {
    this.downloadingItem = index;
    this.loading = true;
    let fileBase64: string;
    this.documentosService
      .obterDocumentoPorGuid(this.empresaId, documentoGuid)
      .subscribe((result) => {
        fileBase64 = result.documentoBase64;
        this.downloadPdf(fileBase64, nomeArquivo);
      });
  }

  onClickDelete(documentoGuid: string) {
    if (this.disableCadastro) return;

    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: { descricao: 'Deseja excluir este arquivo? ' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'delete') {
        this.documentosService
          .deletarDocumento(this.empresaId, documentoGuid)
          .subscribe(
            (response) => {
              if (response.isSuccessful) {
                this.notifierService.showNotification(
                  'Arquivo excluído.',
                  'Sucesso',
                  'success'
                );
                this.carregaListaDocumentos(this.empresaId);
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

  showFile() {
    return this.files !== null;
  }

  formatDate(date: string) {
    return Utility.formatGridDate(date);
  }
}
