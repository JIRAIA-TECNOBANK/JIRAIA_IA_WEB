import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { ValorDominio } from 'src/app/modules/sistemas/sub-modules/admin/core/models/_portal/dominios/valor-dominio.model';
import { CriarBannerRequest } from 'src/app/modules/sistemas/sub-modules/crm/core/requests/configuracoes/gestao-banners/criar-banner.request';
import { ConfiguracoesService } from 'src/app/modules/sistemas/sub-modules/crm/services/configuracoes.service';
import { DominioService } from 'src/app/modules/sistemas/sub-modules/crm/services/dominio.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';

@Component({
  selector: 'app-criar-banner',
  templateUrl: './criar-banner.component.html',
  styleUrls: ['./criar-banner.component.scss']
})
export class CriarBannerComponent implements OnInit {

  constructor(private fb: UntypedFormBuilder,
    private notifierService: NotifierService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private configuracoesService: ConfiguracoesService,
    private dominioService: DominioService,
    private store: Store<{ preloader: IPreloaderState }>) {
    this.bannerId = this.activatedRoute.snapshot.params['bannerId'];
  }

  @ViewChild("fileDropRef", { static: false }) fileDropEl: ElementRef;

  utility = Utility;
  Permissoes = Permissoes;

  formulario: FormGroup;
  header: string = null;

  bannerId: number = null;
  minDateInicio: Date = new Date();
  minDateFim: Date;

  files: any = null;
  acceptedTypes: string[] = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  pipe = new DatePipe('en-US');
  imagemURL: string = "";
  loading: boolean = false;
  fileName: string = "";
  fileDetails: string = "";
  fileExtension: string = "";
  tiposBanners: ValorDominio[];

  ngOnInit(): void {
    this.initializeForm();

    if (this.bannerId) {
      this.store.dispatch(showPreloader({ payload: '' }));
      this.carregarBanner();
    }

    if (!Utility.getPermission([Permissoes.GESTAO_COMUNICADOS_CADASTRAR])) { //TODO
      Utility.modoConsulta(this.formulario);
    }
  }

  /**
   * Trigger para o click do input file
   * @param fileDropRef (Input file)
   */
  onClickFile(fileDropRef: any) {
    if (!Utility.getPermission([Permissoes.GESTAO_COMUNICADOS_CADASTRAR])) return;
    fileDropRef.click();
  }

  fileBrowseHandler(files) {
    if (!Utility.getPermission([Permissoes.GESTAO_COMUNICADOS_CADASTRAR])) return;
    this.prepareFilesList(files);
  }

  onFileDropped($event) {
    if (!Utility.getPermission([Permissoes.GESTAO_COMUNICADOS_CADASTRAR])) return;
    this.prepareFilesList($event);
  }

  getImage() {
    if (this.formulario?.get('imagemBase64').value) {
      return this.formulario?.get('imagemBase64').value;
    }

    if (this.formulario?.get('urlImagem').value) {
      return this.formulario?.get('urlImagem').value;
    }

    return null;
  }

  getTextoBotao() {
    if (this.formulario?.get('descricaoBotao').value) {
      return this.formulario?.get('descricaoBotao').value;
    }

    return 'Entendi';
  }

  onClickConfirmar() {
    if (!this.formulario.valid) return;

    this.store.dispatch(showPreloader({ payload: '' }));
    this.submitBanner();
  }

  bannerUnico() {
    return this.tiposBanners?.filter(tipo => tipo.id == this.formulario.get('tipoBanner').value)[0]?.palavraChave === 'TB_BANNER_UNICO';
  }

  private initializeForm() {
    this.formulario = this.fb.group({
      id: [null],
      tipoBanner: [null, Validators.required],
      titulo: ['', Validators.compose([Validators.required, Validators.maxLength(150)])],
      tipoFrequencia: [1, Validators.required],
      urlImagem: [null],
      nomeArquivoImagem: [null],
      imagemBase64: [null],
      urlDirecionamento: [''],
      agendar: [false],
      dataInicio: [null],
      dataFim: [null]
    });

    this.formulario.get('tipoFrequencia').valueChanges.subscribe(value => {
      this.formulario.get('agendar').patchValue(value == 2);

      if (value == 2) {
        Utility.changeFieldValidators(this.formulario, 'dataInicio', [Validators.required]);
        Utility.changeFieldValidators(this.formulario, 'dataFim', [Validators.required]);
        return;
      }

      this.formulario.get('dataInicio').reset();
      this.formulario.get('dataFim').reset();

      Utility.changeFieldValidators(this.formulario, 'dataInicio', [Validators.nullValidator]);
      Utility.changeFieldValidators(this.formulario, 'dataFim', [Validators.nullValidator]);
    });

    this.carregaCategorias();
  }

  private submitBanner() {
    let banner: CriarBannerRequest = {
      id: this.formulario.get('id').value,
      tipoBanner: this.formulario.get('tipoBanner').value,
      titulo: this.formulario.get('titulo').value,
      urlImagem: this.formulario.get('urlImagem').value,
      nomeArquivoImagem: this.formulario.get('nomeArquivoImagem').value,
      imagemBase64: this.formulario.get('imagemBase64').value?.split('base64,')[1],
      tipoFrequencia: this.formulario.get('tipoFrequencia').value,
      urlLinkDirecionamento: this.formulario.get('urlDirecionamento').value,
      agendar: this.formulario.get('agendar').value,
      dataInicio: this.formulario.get('dataInicio').value,
      dataFim: this.formulario.get('dataFim').value
    };

    if (this.bannerId) {
      this.editarBanner(banner);
      return;
    }

    this.criarBanner(banner);
  }

  private criarBanner(banner: CriarBannerRequest) {
    this.configuracoesService.criarBanner(banner).subscribe(response => {
      if (response.id) {
        this.store.dispatch(closePreloader());
        this.voltar();
        this.notifierService.showNotification('Novo banner criado com sucesso!', '', 'success');
        return;
      }

      this.store.dispatch(closePreloader());
      this.notifierService.showNotification(response.errors[0].message, '', 'error');
    });
  }

  private editarBanner(banner: CriarBannerRequest) {
    this.configuracoesService.editarBanner(banner).subscribe(response => {
      if (response.id) {
        this.store.dispatch(closePreloader());
        this.voltar();
        this.notifierService.showNotification('Banner editado com sucesso!', '', 'success');
        return;
      }

      this.store.dispatch(closePreloader());
      this.notifierService.showNotification(response.errors[0].message, '', 'error');
    });
  }

  /**
   * Converte a lista de arquivos para uma lista normal
   * @param files (Files List)
   */
  private prepareFilesList(files: Array<any>) {
    this.files = null;
    this.files = files[0];

    if (this.acceptedTypes.find(type => type === files[0].type) === undefined) {
      this.notifierService.showNotification('Formato da imagem incompatível com o aceito.', '', 'warning');
      this.formulario.get('imagemBase64').reset();
      return false;
    }

    if (!this.formatBytes(files[0].size)) {
      this.notifierService.showNotification('Tamanho da imagem incompatível com o aceito. Tente novamente.', '', 'warning');
      this.formulario.get('imagemBase64').reset();
      return false;
    }

    this.setImageData(files);

    this.fileDropEl.nativeElement.value = "";
  }

  /**
  * Seta o DialogData com a base64 do arquivo selecionado
  * @param files (Lista de arquivos do input)
  */
  private setImageData(files) {
    const file = files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let base64 = reader.result.toString();
      this.fileExtension = file.name.split('.').pop();
      let nomeArquivo = file.name.replace("." + this.fileExtension, "");
      let valor = nomeArquivo;
      if (valor.length > 30) {
        let invalidChar = 30 - valor.length;
        valor = valor.slice(0, invalidChar)
      }

      this.fileName = valor + "." + this.fileExtension;

      this.formulario.get('imagemBase64').setValue(base64);
      this.formulario.get('nomeArquivoImagem').setValue(this.fileName);
      this.formulario.get('urlImagem').reset();

      let agora = new Date();
      this.fileDetails = this.pipe.transform(agora, 'dd-MM-yy') + ' às ' + this.pipe.transform(agora, 'HH:mm') + ' - tamanho ' + this.formatBytes(this.files?.size);
    };
  }

  /**
   * Formata os bytes
   * @param bytes (Tamanho do arquivo em bytes)
   * @param decimals (Pontos decimais)
   */
  private formatBytes(bytes, decimals = 2) {
    let megabytes = Utility.formatMegabytes(bytes);
    if (megabytes > 10) {
      this.files = null;
      return false;
    }

    let size = megabytes.toFixed(decimals);
    return size + 'MB';
  }

  private carregaCategorias() {
    this.dominioService.obterPorTipo('TIPO_BANNER').subscribe(response => {
      this.tiposBanners = response.valorDominio
    })
  }

  private carregarBanner() {
    this.configuracoesService.obterBannerPorId(this.bannerId).subscribe(response => {
      this.formulario.patchValue({
        id: response.id,
        tipoBanner: response.tipoBanner,
        titulo: response.titulo,
        urlImagem: response.urlImagem,
        nomeArquivoImagem: response.nomeArquivoImagem,
        imagemBase64: response.imagemBase64,
        urlDirecionamento: response.urlLinkDirecionamento,
        agendar: response.agendar,
        tipoFrequencia: response.tipoFrequencia,
        dataInicio: response.dataInicio ? Utility.formatDatePicker(response.dataInicio.split(' ')[0], '/') : null,
        dataFim: response.dataFim ? Utility.formatDatePicker(response.dataFim.split(' ')[0], '/') : null
      });

      this.store.dispatch(closePreloader());
    })
  }

  private voltar() {
    if (this.bannerId) {
      this.router.navigate([`../../`], { relativeTo: this.activatedRoute });
      return;
    }

    this.router.navigate([`../`], { relativeTo: this.activatedRoute });
  }
}
