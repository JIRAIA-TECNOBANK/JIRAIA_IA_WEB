import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, FormControl, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';
import { Empresas } from '../../../../../core/models/empresas/empresas.model';
import { VersaoLote } from '../../../../../core/models/empresas/versao-lote.model';
import { EmpresasService } from '../../../../../services/empresas.service';

@Component({
  selector: 'app-envia-arquivo-lote',
  templateUrl: './envia-arquivo-lote.component.html',
  styleUrls: ['./envia-arquivo-lote.component.scss']
})
export class EnviaArquivoLoteComponent implements OnInit {

  @ViewChild("fileDropRef", { static: false }) fileDropEl: ElementRef;

  files: any = null;
  acceptedTypes: string[];
  fileError: string = null;

  versoesLote: VersaoLote[] = [];
  flags = [];

  formulario = this.formBuilder.group({
    empresaNome: [null, Validators.required],
    empresaId: [null, Validators.required],
    lote: [{ value: null, disabled: true }, Validators.required],
  });

  fileDate: string;
  showOperacao: boolean = false;
  empresas: Empresas[] = [];
  empresasFiltradas: Empresas[] = [];

  constructor(
    private notifierService: NotifierService,
    private dialogService: DialogCustomService,
    private empresaService: EmpresasService,
    private formBuilder: UntypedFormBuilder) { }

  ngOnInit(): void {
    this.dialogService.setDialogData('nodata');
    this.carregarEmpresas();
    this.onVersaoChange();
  }

  ngOnDestroy(): void {
    this.files = null;
    this.dialogService.setDialogData('nodata');
  }

  onFileDropped($event) {
    if (this.formulario.valid) {
      this.prepareFilesList($event);
    }
  }

  fileBrowseHandler(files) {
    this.prepareFilesList(files);
  }

  carregarEmpresas(filtro: string = null) {
    if (filtro) {
      const valueInput = Utility.checkNumbersOnly(filtro)

      if (valueInput.length < 3) return;

      this.empresaService.obterEmpresasFiltro(0, 10, valueInput).subscribe(response => {
        if (response.isSuccessful) {
          this.empresas = response.empresas;
          this.formatarEmpresas(response.empresas);
        }
      })

      return;
    }

    this.empresaService.obterEmpresas(0, 10).subscribe(response => {
      if (response.isSuccessful) {
        this.empresas = response.empresas;
        this.formatarEmpresas(response.empresas);
      }
    });
  }

  formatarEmpresas(empresas: Empresas[]) {
    let empresasLista = empresas;
    empresasLista.forEach(empresa => { empresa.cnpj = Utility.formatCnpj(empresa.cnpj) });
    this.empresasFiltradas = empresasLista;
  }

  /**
   * Converte a lista de arquivos para uma lista normal
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    this.files = null;

    if (this.acceptedTypes.find(type => type === files[0].type) === undefined) {
      if (this.formulario.controls['lote'].value == 'v020' || this.formulario.controls['lote'].value == 'v021') {
        this.fileError = 'Formato não permitido. Os formatos aceitos para envio de lote são: CSV e TXT. Por gentileza, verifique e faça o reenvio.'
      } else if (this.formulario.controls['lote'].value == 'v080') {
        this.fileError = 'Formato não permitido. Os formatos aceitos para envio de lote são: XLSX e TXT. Por gentileza, verifique e faça o reenvio.';
      } else {
        this.fileError = 'Formato não permitido. O formato aceito para envio de lote é: TXT. Por gentileza, verifique e faça o reenvio.'
      }
      this.notifierService.showNotification('Arquivo com formato inválido.', 'Atenção', 'error');
      this.dialogService.setDialogData('nodata');
      return false;
    }

    this.files = files[0];
    this.fileDate = new Date().toISOString();

    if (files && this.formulario.valid) this.setDialogData(files);

    this.fileDropEl.nativeElement.value = "";
  }

  /**
   * Formata os bytes
   * @param bytes (Tamanho do arquivo em bytes)
   * @param decimals (Pontos decimais)
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1000;
    const dm = decimals <= 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    let size = parseFloat((bytes / Math.pow(k, i)).toFixed(dm))

    return size + " " + sizes[i];
  }

  /**
   * Trigger para o click do input file
   * @param fileDropRef (Input file)
   */
  onClickFile(fileDropRef: any) {
    fileDropRef.click();
  }

  /**
   * Seta o DialogData com a base64 do arquivo selecionado
   * @param files (Lista de arquivos do input)
   */
  setDialogData(files) {
    const file = files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let idLote = this.versoesLote.filter(v => v.palavraChave == this.formulario.controls['lote'].value)
      let base64 = reader.result.toString();

      this.dialogService.setDialogData({
        versaoLote: idLote[0].palavraChave,
        nomeArquivo: file.name,
        operacao: this.formulario.controls['operacao'] ? this.formulario.controls['operacao'].value : null,
        file: base64.split('base64,')[1],
        empresaId: this.formulario.get('empresaId').value,
        nomeEmpresa: this.empresas.filter(e => e.id == this.formulario.get('empresaId').value)[0].nomeFantasia
      });
    };
  }

  carregarVersoesLote(empresaId: number) {
    this.versoesLote = [];
    this.empresaService.obterDadosEmpresa(empresaId).subscribe(response => {
      if (response.id) {
        response.versoesLote.forEach((vl: VersaoLote) => { this.versoesLote.push(vl); })
        this.formulario.get('lote').enable();
      }
    })
  }

  onVersaoChange() {
    this.formulario.controls['lote'].valueChanges.subscribe(value => {
      this.files = null;
      this.fileError = null;
      this.dialogService.setDialogData('nodata');
      if (value === 'v020' || value === 'v021') {
        this.acceptedTypes = ["text/csv", "text/plain"];
      } else if (value === 'v080') {
        this.acceptedTypes = ["text/plain", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
      }
      else {
        this.acceptedTypes = ["text/plain"];
      }

      if (value === 'v021') {
        this.showOperacao = true;
        this.formulario.addControl('operacao', new FormControl('', Validators.required));

        this.formulario.controls['operacao'].valueChanges.subscribe(value => {
          if (!value) {
            this.files = null;
            this.fileError = null;
            this.dialogService.setDialogData('nodata');
          }

        })
      } else {
        this.formulario.removeControl('operacao');
        this.showOperacao = false;
      }

    })
  }

  selecionaEmpresaId() {
    let empresaSelecionada = this.formulario.get('empresaNome').value;
    if (!empresaSelecionada) {
      this.formulario.get('empresaId').reset();
      return;
    }

    let empresaTxt = this.formulario.get('empresaNome').value.split(' - ');
    let cnpj = this.formulario.get('empresaNome').value.split(' - ')[empresaTxt.length - 1];

    if (!cnpj) {
      this.formulario.get('empresaId').reset();
      return;
    }

    let empresaCnpj = this.empresas.filter(e => Utility.checkNumbersOnly(e.cnpj).indexOf(Utility.checkNumbersOnly(cnpj)) > -1)[0];
    if (!empresaCnpj) {
      this.formulario.get('empresaId').reset();
      return;
    }

    if (this.formulario.get('empresaId').value == empresaCnpj.id) return;

    this.formulario.get('empresaId').setValue(empresaCnpj.id);
    this.carregarVersoesLote(this.formulario.get('empresaId').value);
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(<TipoElemento>tipoElemento, nomeElemento, guidElemento);
  }

  formatDate(date: string) {
    return Utility.formatDateTime(date);
  }

}
