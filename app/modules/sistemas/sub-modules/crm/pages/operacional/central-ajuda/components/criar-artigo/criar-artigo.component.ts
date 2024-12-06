import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { CentralAjudaService } from '../../../../../services/central-ajuda.service';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { Store } from '@ngrx/store';
import { Utility } from 'src/app/core/common/utility';
import { Permissoes } from 'src/app/core/common/permissoes';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { CriarArtigoRequest } from '../../../../../core/requests/central-ajuda/criar-artigos.request';
import { AngularEditorConfig, UploadResponse } from '@kolkov/angular-editor';
import { Observable } from 'rxjs';
import { HttpEvent } from '@angular/common/http';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { DialogComplementarComponent } from '../dialog-complementar/dialog-complementar.component';
import { SecoesFiltro } from '../../../../../core/models/central-ajuda/secoes-filtro';
import { SecoesPaginado } from '../../../../../core/models/central-ajuda/secoes-paginado';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';
import { StatusArtigo } from '../../../../../core/enums/tipo-status-artigo.enum';

@Component({
  selector: 'app-criar-artigo',
  templateUrl: './criar-artigo.component.html',
  styleUrls: ['./criar-artigo.component.scss']
})
export class CriarArtigoComponent implements OnInit {

  constructor(private fb: UntypedFormBuilder,
    private notifierService: NotifierService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private centralAjudaService: CentralAjudaService,
    private store: Store<{ preloader: IPreloaderState }>,
    private dialog: MatDialog,
    private dialogService: DialogCustomService) {
    this.artigoId = this.activatedRoute.snapshot.params['artigoId'];
    this.secaoId = this.activatedRoute.snapshot.params['secaoId'];
  }

  utility = Utility;
  Permissoes = Permissoes;
  formulario: FormGroup;
  artigoId: number = null;
  secaoId: number = null;

  childstate: boolean = false;

  htmlContent = '';
  config: AngularEditorConfig = {
    editable: Utility.getPermission([Permissoes.GESTAO_COMUNICADOS_CADASTRAR]),
    spellcheck: true,
    height: '15rem',
    minHeight: '5rem',
    placeholder: '',
    translate: 'no ',
    defaultParagraphSeparator: 'span',
    defaultFontName: 'Arial',
    outline: false,
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'montserrat', name: 'Montserrat' },
      { class: 'segoe-ui', name: 'Segoe UI' },
      { class: 'times-new-roman', name: 'Times New Roman' },
    ],
    toolbarHiddenButtons: [
      [
        'undo',
        'redo',
        'subscript',
        'superscript',
        'justifyLeft',
        'justifyCenter',
        'justifyRight',
        'justifyFull',
        'indent',
        'outdent',
        'heading',
      ],
      [
        'backgroundColor',
        'customClasses',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'removeFormat',
        'toggleEditorMode'
      ]
    ],
    uploadUrl: 'v1/image',
    upload: (file: File) => { return new Observable<HttpEvent<UploadResponse>>() },
    uploadWithCredentials: false
  };

  listSecoes: SecoesPaginado[] = [];
  urlVideo: string = null;
  arquivo: any = null;
  timer: NodeJS.Timeout;

  ngOnInit(): void {
    this.initializeForm();
    if (this.artigoId) {
      this.store.dispatch(showPreloader({ payload: '' }));
      this.carregaArtigo();
    }

    if (!Utility.getPermission([Permissoes.GESTAO_CENTRAL_AJUDA_CADASTRAR])) {
      Utility.modoConsulta(this.formulario);
    }

    this.dialogService.dialogData$.subscribe(response => {
      if (response.dataType == 'add-video') { this.urlVideo = response.data; }
      if (response.dataType == 'add-arquivo') { this.arquivo = response.data; }
    });
  }

  onClickConfirmar() {
    if (!this.formulario.valid) return;

    this.store.dispatch(showPreloader({ payload: '' }));
    this.submitArtigo();
  }

  onClickVideo() {
    let dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: DialogComplementarComponent,
        title: 'Adicionar vídeo',
        titleClass: 'desk text-gray-800',
        content: this.formulario.get('urlVideo').value,
        type: 'add-video',
        disableSaveWithoutData: true,
        buttonCancel: {
          value: false,
          text: 'Fechar',
        },
        buttonConfirm: {
          value: true,
          text: 'Adicionar',
        }
      },
    });

    dialogRef.afterClosed().subscribe(confirmacao => {
      if (confirmacao) { this.formulario.get('urlVideo').patchValue(this.urlVideo); }
    });
  }

  onClickArquivo() {
    let dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: DialogComplementarComponent,
        title: 'Adicionar arquivos',
        titleClass: 'desk text-gray-800',
        content: this.formulario.get('arquivos').value,
        type: 'add-arquivo',
        disableSaveWithoutData: true,
        buttonCancel: {
          value: false,
          text: 'Fechar',
        },
        buttonConfirm: {
          value: true,
          text: 'Adicionar',
        }
      },
    });

    dialogRef.afterClosed().subscribe(confirmacao => {
      if (confirmacao) { this.formulario.get('arquivos').patchValue(this.arquivo); }
    });
  }

  carregarSecoes(secao: string = null) {
    let filtro: SecoesFiltro = <SecoesFiltro>{
      pageIndex: 0,
      pageSize: 10
    };

    this.listSecoes = [];
    if (secao?.length >= 3) { filtro.secao = secao }

    this.centralAjudaService.obterSecoesPaginado(filtro).subscribe(response => {
      let secoes = [];
      response.listaSecao.forEach(secao => {
        secoes.push(<SecoesPaginado>{ id: secao.id, descricao: secao.descricao, titulo: secao.titulo });
      });

      this.listSecoes = secoes;

      if (this.secaoId) {
        this.formulario.get('secaoId').patchValue(this.secaoId);
        this.formulario.get('secao').patchValue(this.listSecoes?.filter(secao => secao.id === +this.secaoId)[0]?.titulo)
      }
    });
  }

  selecionaSecaoId() {
    let secaoTitulo = this.formulario.get('secao').value;
    let secaoSelecionada = this.listSecoes.filter(secao => secao.titulo === secaoTitulo)[0];

    if (secaoSelecionada?.id === this.formulario.get('secaoId').value) return;

    this.formulario.get('secaoId').patchValue(secaoSelecionada?.id);
  }

  private initializeForm() {
    this.formulario = this.fb.group({
      id: [null],
      titulo: [null, Validators.compose([Validators.required, Validators.maxLength(150)])],
      secao: [null],
      secaoId: [null, Validators.required],
      conteudo: [null],
      statusArtigo: [StatusArtigo.Rascunho, Validators.required],
      urlVideo: [null],
      arquivos: [null]
    });

    this.carregarSecoes();
  }

  private submitArtigo() {
    let artigo: CriarArtigoRequest = {
      titulo: this.formulario.get('titulo').value,
      secaoId: this.formulario.get('secaoId').value,
      conteudoComplementar: this.formulario.get('conteudo').value,
      statusArtigo: this.formulario.get('statusArtigo').value,
      urlVideo: this.formulario.get('urlVideo').value,
      listaArquivos: this.formulario.get('arquivos').value ?? []
    };

    if (this.artigoId) {
      this.editarArtigo(artigo);
      return;
    }

    this.criarArtigo(artigo);
  }

  private criarArtigo(artigo: CriarArtigoRequest) {
    this.centralAjudaService.criarArtigo(artigo).subscribe(response => {
      if (response.artigoId) {
        this.store.dispatch(closePreloader());
        this.voltar();
        this.notifierService.showNotification('Artigo criado com sucesso!', '', 'success');
        return;
      }

      this.store.dispatch(closePreloader());
      this.notifierService.showNotification(response.errors[0].message, '', 'error');
    });
  }

  private editarArtigo(artigo: CriarArtigoRequest) {
    this.centralAjudaService.editarArtigo(this.artigoId, artigo).subscribe(response => {
      if (response.id) {
        this.store.dispatch(closePreloader());
        this.voltar();
        this.notifierService.showNotification('Artigo editado com sucesso!', '', 'success');
        return;
      }

      this.store.dispatch(closePreloader());
      this.notifierService.showNotification(response.errors[0].message, '', 'error');
    });
  }

  private carregaArtigo() {
    this.centralAjudaService.obterArtigoPorId(this.artigoId).subscribe(response => {
      this.formulario.patchValue({
        id: response.id,
        titulo: response.titulo,
        conteudo: response.conteudoComplementar,
        secaoId: response.secaoId,
        secao: this.listSecoes?.filter(secao => secao.id === response.secaoId)[0]?.titulo,
        statusArtigo: response.statusArtigo === StatusArtigo.Arquivado ? null : response.statusArtigo,
        urlVideo: response.urlVideo,
        arquivos: response.listaArquivos?.length == 0 ? null : response.listaArquivos
      });

      if (this.listSecoes.length == 0) {
        Utility.watchCondition(this.timer, () => {
          if (this.listSecoes.length > 0) {
            this.formulario.get('secao').patchValue(this.listSecoes.filter(secao => secao.id === response.secaoId)[0].titulo);
            this.store.dispatch(closePreloader());
            return true;
          }
        }, 1000);
      }
      else { this.store.dispatch(closePreloader()); }
    })
  }

  private voltar() {
    if (this.artigoId || this.secaoId) {
      this.router.navigate([`../../`], { relativeTo: this.activatedRoute });
      return;
    }

    this.router.navigate([`../`], { relativeTo: this.activatedRoute });
  }
}
